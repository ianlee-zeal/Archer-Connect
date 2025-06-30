import { Directive, HostListener, HostBinding, EventEmitter, Output, Input } from '@angular/core';
import { FileHelper } from '@app/helpers/file.helper';
import * as MsgReader from '@sharpenednoodles/msg.reader-ts';

@Directive({ selector: '[appDragAndDrop]' })
export class DragAndDropDirective {
  @HostBinding('class.invalid') public isInvalidClass;
  @HostBinding('class.valid') public isValidClass;
  @Output() public filesDropped = new EventEmitter<File[]>();
  @Input() public stopPropagation = true;
  @Input() public multiple = false;
  @Input() public onError?: (error: string) => void;

  @HostListener('dragover', ['$event']) public onDragOver(evt: DragEvent): void {
    evt.preventDefault();
    evt.stopPropagation();
    const length = (evt.dataTransfer.items.length && evt.dataTransfer.items[0].kind === 'file')
      ? evt.dataTransfer.items.length
      : evt.dataTransfer.files.length;
    if ((!this.multiple && length && length == 1)
      || (this.multiple && length >= 1)) {
      this.isValidClass = true;
      this.isInvalidClass = false;
    } else if (
      (this.multiple && length == 0)
    || (!this.multiple && length > 1)) {
      this.isValidClass = false;
      this.isInvalidClass = true;
    }
  }

  @HostListener('dragleave', ['$event']) public onDragLeave(evt: DragEvent): void {
    evt.preventDefault();
    evt.stopPropagation();
    this.isValidClass = false;
    this.isInvalidClass = false;
  }

  @HostListener('drop', ['$event']) public onDrop(evt: DragEvent): void {
    evt.preventDefault();
    if (this.stopPropagation) {
      evt.stopPropagation();
    }

    const items = evt.dataTransfer.items;
    if (!this.multiple && items.length && items.length == 1) {
      this.onDropSingle(items);
    } else if (this.multiple && items.length >= 1) {
      this.onDropMultiple(items);
    }
  }

  private onDropSingle(items: DataTransferItemList): void {
    const fileList: File[] = [];
    Array.from(items).forEach(item => {
      const itemFile = item.getAsFile();
      if (itemFile) {
        fileList.push(item.getAsFile());
      }
    });
    this.filesDropped.emit(fileList);
  }

  private onDropMultiple(items: DataTransferItemList): void {
    const fileList: File[] = [];
    const msgFilesList: File[] = [];
    const itemsList = Array.from(items);
    for (let index = 0; index < itemsList.length; index++) {
      const item = itemsList[index];
      const file = item.getAsFile();
      if (file) {
        const fileExtension = FileHelper.getExtension(file.name);
        if (fileExtension !== 'msg') {
          fileList.push(file);
        } else {
          msgFilesList.push(file);
        }
      }
    }

    const processItems = (files: File[]) => Promise.all(
      files.map(async file => {
        const bytes = await file.arrayBuffer();
        const msgReader = new MsgReader.MSGReader(bytes);
        const parseResult = msgReader.getFileData();
        const error = (parseResult as MsgReader.MSGErrorResult).error;
        if (error) {
          if (this.onError) {
            this.onError(error);
          }
          return;
        }

        const outlookData = parseResult as MsgReader.MSGFileData;
        const attachments = new Array<MsgReader.MSGAttachmentData>();
        for (let i = 0; i < outlookData.attachments.length; i++) {
          attachments.push(msgReader.getAttachment(i));
        }

        fileList.push(file);
        for (let i = 0; i < attachments.length; i++) {
          const currentAttachment = outlookData.attachments[i] as any;
          fileList.push(new File([attachments[i].content], currentAttachment.fileName, { type: currentAttachment.mimeType ? currentAttachment.mimeType : 'application/octet-stream' }));
        }
      }),
    ).then(() => {
      this.filesDropped.emit(fileList);
    });

    processItems(msgFilesList);
  }
}
