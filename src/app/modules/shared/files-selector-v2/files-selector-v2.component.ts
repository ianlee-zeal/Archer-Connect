import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { FileValidatorService, ToastService } from '@app/services';
import { FileHelper } from '@app/helpers/file.helper';


@Component({
  selector: 'app-files-selector-v2',
  templateUrl: './files-selector-v2.component.html',
  styleUrls: ['./files-selector-v2.component.scss'],
})
export class FilesSelectorComponentV2 implements OnDestroy {
  @Input() set initialFiles(files: File[]) {
    if (files && files.length > 0) {
      this.selectedFiles = [...files];
      this.extractFileNames();
    }
  }
  @Input() selectButtonTitle: string;
  @Input() allowMultiple: boolean;
  @Input() isBtnDisabled: boolean = false;

  @Input() maxFilesCount: number = 5;
  @Input() maxFileSize: number = 500 * 1024 * 1024;
  @Input() maxFileSizeErrorMessage: string;
  @Output() public filesSelected = new EventEmitter<File[]>();

  public error: string;

  private readonly ngUnsubscribe = new Subject<void>();
  protected selectedFiles: File[] = [];

  public fileNames: string[] = [];

  constructor(
    private readonly fileValidatorService: FileValidatorService,
    private readonly toaster: ToastService,
  ) { }

  public onFilesSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target.files);

    if (files.length > 0) {
      this.emitValidFiles(files);
    }

    target.value = '';
  }

  public removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.extractFileNames();
    this.filesSelected.emit(this.selectedFiles);
  }

  public clearFileList(): void {
    this.selectedFiles = [];
  }

  private emitValidFiles(selectedFiles: File[]): void {

    this.fileValidatorService.validateFileSize(selectedFiles, this.maxFileSize)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(({ error, validFiles }) => {
        this.error = error ? (this.maxFileSizeErrorMessage || error) : null;
        if (error) this.toaster.showError(this.error);
        this.selectedFiles.push(...validFiles);
        this.extractFileNames();
        this.filesSelected.emit(this.selectedFiles || []);
      });
  }

  public onError(error: string) {
    this.error = error;
  }

  private extractFileNames(): void {
    const fileExtensions = this.selectedFiles.map(file => FileHelper.getExtension(file.name));
    this.fileNames = this.selectedFiles.map((file, index) => {
      const extension = fileExtensions[index];
      return FileHelper.extractFileName(file.name, extension);
    });
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
