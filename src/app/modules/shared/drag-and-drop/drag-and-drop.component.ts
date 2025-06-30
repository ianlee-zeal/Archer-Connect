import { Component, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { FileValidatorService } from '@app/services';

@Component({
  selector: 'app-drag-and-drop',
  templateUrl: './drag-and-drop.component.html',
  styleUrls: ['./drag-and-drop.component.scss'],
})
export class DragAndDropComponent implements OnInit, OnChanges, OnDestroy {
  @Input() public allowedFileTypes: string[];
  @Input() public valueClass: string;
  @Input() public btnValueClass: string;
  @Input() public isDisabled: boolean;
  @Input() public isSelectButtonInside: boolean;
  @Input() public selectedFile: File;
  @Input() public selectedFiles: File[];
  @Input() public title: string;
  @Input() public stopPropagation: boolean = true;
  @Input() public multiple: boolean = false;
  @Output() public filesSelected = new EventEmitter<File[]>();

  public allowedTypesCSV: string;
  public error: string;
  public areaTitle: string;

  private ngUnsubscribe = new Subject<void>();

  constructor(
    private fileValidatorService: FileValidatorService,
  ) { }

  ngOnInit() {
    if (!this.title) {
      if (this.multiple) {
        this.title = 'Select Files';
      } else {
        this.title = 'Select File';
      }
    }
    if (this.multiple) {
      this.areaTitle = 'Drag and upload files';
    } else {
      this.areaTitle = 'Drag and upload file';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.allowedFileTypes && this.allowedFileTypes && this.allowedFileTypes.length > 0) {
      this.allowedTypesCSV = this.allowedFileTypes.join(',');
    }
  }

  public onFilesDropped(files: File[]): void {
    if (this.multiple) {
      this.addFileIfValid(files);
    } else {
      this.addFileIfValid([files[0]]);
    }
  }

  public onFilesAdded(selectFileInput: HTMLInputElement) {
    const input = selectFileInput;
    const files = Array.from(input.files as FileList);
    if (this.multiple) {
      this.addFileIfValid(files);
    } else {
      this.addFileIfValid([files[0]]);
    }
    input.value = null; // AC-7578 allow user to select the same file more than once
  }

  public onError(error: string) {
    this.error = error;
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private addFileIfValid(files: File[]): void {
    if (!files || files.length === 0) {
      return;
    }

    if (this.isDisabled) {
      this.filesSelected.emit([]);
      return;
    }

    this.fileValidatorService.validateFileType(files, this.allowedFileTypes)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(({ error, validFiles }) => {
        this.error = error || null;
        if (this.multiple) {
          this.filesSelected.emit(validFiles || []);
        } else {
          this.selectedFile = files[0];
          this.filesSelected.emit(!error ? [files[0]] : []);
        }
      });
  }
}
