import { Component, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { FileValidatorService } from '@app/services';

@Component({
  selector: 'app-drag-and-drop-modern',
  templateUrl: './drag-and-drop-modern.component.html',
  styleUrls: ['./drag-and-drop-modern.component.scss'],
})
export class DragAndDropModernComponent implements OnInit, OnChanges, OnDestroy {
  @Input() public allowedFileTypes: string[];
  @Input() public valueClass: string;
  @Input() public btnValueClass: string;
  @Input() public isDisabled: boolean;
  @Input() public selectedFile: File;
  @Input() public selectedFiles: File[];
  @Input() public stopPropagation: boolean = true;
  @Input() public multiple: boolean = false;
  @Output() public filesSelected = new EventEmitter<File[]>();

  public allowedTypesCSV: string;
  public error: string;

  private ngUnsubscribe = new Subject<void>();

  constructor(
    private fileValidatorService: FileValidatorService,
  ) { }

  ngOnInit() {
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
    input.value = null;
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
