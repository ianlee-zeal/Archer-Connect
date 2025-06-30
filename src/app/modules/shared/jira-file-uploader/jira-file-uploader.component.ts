import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { IconHelper } from '@app/helpers';
import { JiraUploadStatus } from '@app/models/jira/jira-upload-status';
import { UploadTile } from '@app/models/jira/jira-upload-tile';
import { CommunicationHubService } from '@app/services/api/communication-hub.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'jira-file-uploader',
  templateUrl: './jira-file-uploader.component.html',
  styleUrl: './jira-file-uploader.component.scss'
})
export class JiraFileUploaderComponent implements OnDestroy {
  protected readonly JiraUploadStatus = JiraUploadStatus;
  protected readonly IconHelper = IconHelper;

  composeFiles: UploadTile[] = [];
  exceedsFileLimit = false;
  maxFileSize: number = 50 * 1024 * 1024;

  @Input() columns: number = 1;

  @Output() filesChanged = new EventEmitter<UploadTile[]>();

  private ngUnsubscribe$ = new Subject<void>();

  constructor(private communicationHubService: CommunicationHubService) { }

  onFilesSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files ? Array.from(target.files) : [];

    if (files.length === 0) {
      return;
    }

    const existingFileNames = new Set(this.composeFiles.map(f => f.file.name));
    const newFiles = files.filter(file => !existingFileNames.has(file.name));
    if (newFiles.length === 0) {
      target.value = '';
      return;
    }

    const zeroByteFiles = newFiles.filter(f => f.size === 0);
    const oversizedFiles = newFiles.filter(f => f.size > this.maxFileSize);
    const validFiles = newFiles.filter(f => f.size > 0 && f.size <= this.maxFileSize);

    const totalNewTilesCount = zeroByteFiles.length + oversizedFiles.length + validFiles.length;
    const availableSlots = 5 - this.composeFiles.length;

    if (availableSlots <= 0 || totalNewTilesCount <= 0) {
      this.exceedsFileLimit = true;
      target.value = '';
      return;
    }

    const sliceLimit = availableSlots;

    const zeroByteTiles: UploadTile[] = zeroByteFiles
      .slice(0, sliceLimit)
      .map(file => ({
        file,
        status: JiraUploadStatus.Error,
        progress: 0,
        errorMessage: 'Error - File is 0MB'
      }));

    const remainingSlotsAfterZero = sliceLimit - zeroByteTiles.length;

    const oversizedTiles: UploadTile[] = oversizedFiles
      .slice(0, remainingSlotsAfterZero)
      .map(file => ({
        file,
        status: JiraUploadStatus.Error,
        progress: 0,
        errorMessage: 'Error - File is greater than 50MB'
      }));

    const remainingSlotsAfterErrors = remainingSlotsAfterZero - oversizedTiles.length;

    const uploadTiles: UploadTile[] = validFiles
      .slice(0, remainingSlotsAfterErrors)
      .map(file => ({
        file,
        status: JiraUploadStatus.Uploading,
        progress: 10
      }));

    const allTiles = [...zeroByteTiles, ...oversizedTiles, ...uploadTiles];

    this.composeFiles.push(...allTiles);
    this.filesChanged.emit(this.composeFiles);
    this.uploadFiles(uploadTiles);

    this.exceedsFileLimit = this.composeFiles.length >= 5;

    target.value = '';
  }

  private uploadFiles(files: UploadTile[]): void {
    files.forEach(fileTile => {
      this.communicationHubService.uploadJiraFile(fileTile.file)
        .pipe(takeUntil(this.ngUnsubscribe$))
        .subscribe({
          next: (event: HttpEvent<any>) => {
            if (event.type === HttpEventType.UploadProgress) {
              const calculated = event.total ? Math.round(100 * event.loaded / event.total) : 0;
              if (calculated !== fileTile.progress) {
                fileTile.progress = calculated;
              }
            } else if (event.type === HttpEventType.Response) {
              fileTile.status = JiraUploadStatus.Success;
              fileTile.fileUploadedId = event.body?.temporaryAttachmentId;
              this.filesChanged.emit(this.composeFiles);
            }
          },
          error: () => {
            fileTile.status = JiraUploadStatus.Error;
            fileTile.errorMessage = 'Error - Failed to upload';
            this.filesChanged.emit(this.composeFiles);
          },
        });
    });
  }

  clearFiles(): void {
    this.composeFiles = [];
    this.exceedsFileLimit = false;
    this.filesChanged.emit(this.composeFiles);
  }

  removeFile(index: number): void {
    this.composeFiles.splice(index, 1);

    if (this.composeFiles.length < 5) {
      this.exceedsFileLimit = false;
    }

    this.filesChanged.emit(this.composeFiles);
  }

  getFileExtension(fileName: string): string {
    return fileName?.split('.').pop() ?? '';
  }

  ngOnDestroy() {
    this.composeFiles = [];
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
