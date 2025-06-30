import { FileHelper } from '@app/helpers/file.helper';
import { Attachment } from '@app/models/attachment';
import { ValidationForm } from './validation-form';

export abstract class AttachmentForm extends ValidationForm {
  public selectedFile: File;
  public attachments: Attachment[] = [];

  protected abstract get isValidAttachment(): boolean;

  protected convertToAttachment(file: File): Attachment {
    const fileName = file.name;
    const extension = FileHelper.getExtension(fileName);
    const attachment = new Attachment();
    attachment.name = FileHelper.extractFileName(fileName, extension);
    attachment.fileName = fileName;
    attachment.fileExtension = extension;
    attachment.file = file;

    switch (true) {
      case (file.type.indexOf('image') === 0) :
        const reader = new FileReader();
        reader.onload = () => {
          attachment.imageUrl = reader.result as string;
        }
        reader.readAsDataURL(file);
        break;

      case (file.type.indexOf('sheet') >= 0) :
        attachment.imageUrl = "/assets/images/thumbnail-excel.png";
        break;

      case (file.type.indexOf('csv') >= 0) :
        attachment.imageUrl = "/assets/images/thumbnail-excel.png";
        break;

      case (file.type.indexOf('word') >= 0) :
        attachment.imageUrl = "/assets/images/thumbnail-word.png";
        break;

      case (file.type.indexOf('present') >= 0) :
        attachment.imageUrl = "/assets/images/thumbnail-powerpoint.png";
        break;

      case (file.type.indexOf('pdf') >= 0) :
        attachment.imageUrl = "/assets/images/thumbnail-pdf.png";
        break;

      default:
        attachment.imageUrl = "/assets/images/thumbnail-file.png";

    }

    return attachment;
  }

  public onFileSelected(file: File): void {
    this.selectedFile = file;
    const attachment = this.convertToAttachment(this.selectedFile);
    this.attachments.push(attachment);
    setTimeout(() => {
      this.selectedFile = null;
    });
  }

  public onRemoveSelectedFile(attachment: Attachment): void {
    const index = this.attachments.findIndex(item => item.name === attachment.name);
    if (index > -1) {
      this.attachments.splice(index, 1);
    }
  }

  public onPaste(e: any ) {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    let blob = null;

    for (const item of items) {
      if (item.type.indexOf('image') === 0) {
        blob = item.getAsFile();
        this.attachments.push(this.convertToAttachment(blob));
      }
    }
  }

  public openAttachment(attachment: Attachment) {
    var fileURL = window.URL.createObjectURL(attachment.file);
    let tab = window.open();
    tab.location.href = fileURL;
  }
}
