import { Component, OnDestroy, OnInit } from '@angular/core';
import { FileHelper } from '@app/helpers/file.helper';
import { BankAccountSettings } from '@app/models/bank-account-settings';
import * as fromAuth from '@app/modules/auth/state';
import { ModalService, ToastService } from '@app/services';
import { AppState } from '@app/state/index';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import * as uploadW9Actions from '../state/actions';
import * as uploadW9Selectors from '../state/selectors';
import { UploadProgressModalComponent } from '../upload-progress-modal/upload-progress-modal.component';

@Component({
  selector: 'app-upload-w9',
  templateUrl: './upload-w9.component.html',
  styleUrls: ['./upload-w9.component.scss'],
})
export class UploadW9Component implements OnInit, OnDestroy {
  private readonly user$ = this.store.select(fromAuth.authSelectors.getUser);
  protected readonly w9Settings$ = this.store.select(uploadW9Selectors.selectW9Settings);
  private ngUnsubscribe$ = new Subject<void>();

  protected allowedExtensions: string[] = [];
  private maxFileSizeInBytes: number;
  protected selectedFile: File | null = null;
  protected isW9Current: boolean = false;

  protected currentYear: number = new Date().getFullYear();

  constructor(
    private store: Store<AppState>,
    private modalService: ModalService,
    private toaster: ToastService,
  ) { }

  ngOnInit(): void {
    this.store.dispatch(uploadW9Actions.GetW9Settings());

    this.w9Settings$.pipe(
      filter((settings: BankAccountSettings) => !!settings),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((w9Settings: BankAccountSettings) => {
      this.isW9Current = !w9Settings.w9FileRequired;
      this.allowedExtensions = w9Settings.allowedFileExtensions;
      this.maxFileSizeInBytes = w9Settings.maxW9FileSizeInBytes;
    });
  }

  selectFile(files: File[]): void {
    this.selectedFile = files[0] || null;

    if (this.selectedFile && this.selectedFile.size > this.maxFileSizeInBytes) {
      this.toaster.showError(`File exceeds the size limit of ${FileHelper.bytesToMegabytes(this.maxFileSizeInBytes)}MB `);
      this.selectedFile = null;
      return;
    }

    if (this.selectedFile.name.length > FileHelper.maxFileNameLength) {
      this.toaster.showWarning('File name exceeds the maximum length. The name of the file has been truncated.');
    }
  }

  submitW9Document(): void {
    if (!this.isValid()) {
      this.toaster.showError('Please select a file to upload');
      return;
    }

    const modalRef = this.modalService.show(UploadProgressModalComponent);

    this.subscribeToModalVisibility(modalRef);
    this.store.dispatch(uploadW9Actions.UploadW9({ file: this.selectedFile }));
  }

  subscribeToModalVisibility(modalRef): void {
    modalRef.onHidden
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(() => {
        if (!modalRef.content.uploading) {
          this.selectedFile = null;
        }
        this.store.dispatch(uploadW9Actions.GetW9Settings());
      });
  }

  isValid(): boolean {
    return !!this.selectedFile;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
