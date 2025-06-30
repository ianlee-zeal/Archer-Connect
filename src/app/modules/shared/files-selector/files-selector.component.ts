import { Component, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-files-selector',
  templateUrl: './files-selector.component.html',
  styleUrls: ['./files-selector.component.scss'],
})
export class FilesSelectorComponent implements OnInit, OnChanges, OnDestroy {
  @Input() set initialFiles(files: File[]) {
    if (files && files.length > 0) {
      this.selectedFiles = [...files];
    }
  }
  @Input() selectButtonTitle: string;
  @Input() selectButtonClass: string;
  @Input() allowMultiple: boolean;
  @Input() isBtnDisabled: boolean = false;
  @Output() public filesSelected = new EventEmitter<File[]>();

  public error: string;
  public areaTitle: string;

  private ngUnsubscribe = new Subject<void>();
  selectedFiles: File[] = [];

  constructor(
  ) { }

  ngOnInit() {
  }

  ngOnChanges(_: SimpleChanges): void {

  }

  onFilesSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const selectedFiles = target.files;

    if (selectedFiles) {
      this.selectedFiles.push(...Array.from(selectedFiles));
      this.emitFiles();
    }

    target.value = '';
  }


  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.emitFiles();
  }

  private emitFiles(): void {
    this.filesSelected.emit(this.selectedFiles);
  }



  public onError(error: string) {
    this.error = error;
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
