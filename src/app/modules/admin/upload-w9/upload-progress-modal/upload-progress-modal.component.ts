import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastService } from '@app/services';
import { Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { filter, skip, takeUntil } from 'rxjs/operators';
import { DocumentValidationResult } from '@app/models/upload-w9/document-validation-result';
import { W9ValidationStatus } from '@app/models/enums/w9-validation-status.enum';
import { UploadW9State } from '../state/reducer';
import * as selectors from '../state/selectors';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-upload-progress-modal',
  templateUrl: './upload-progress-modal.component.html',
  styleUrls: ['./upload-progress-modal.component.scss'],
})
export class UploadProgressModalComponent implements OnInit, OnDestroy {
  private readonly uploading$ = this.store.select(selectors.selectIsUploading);
  private readonly validationResult$ = this.store.select(selectors.selectValidationResult);
  protected validationResult: DocumentValidationResult | null = null;

  uploading: boolean = true;
  progressStyle: string = '0%';
  messages: SafeHtml[] = [];
  private ngUnSubscribe$ = new Subject<void>();

  constructor(
    private toaster: ToastService,
    private store: Store<UploadW9State>,
    private modalWindow: BsModalRef,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit(): void {
    this.subscribeToUpload();

    this.validationResult$.pipe(
      skip(1),
      filter((result: DocumentValidationResult) => !!result),
      takeUntil(this.ngUnSubscribe$),
    ).subscribe((result: DocumentValidationResult) => {
      this.validationResult = result;
      this.sanitizeMessages(result.messages);
    });
  }

  sanitizeMessages(messages: string[]): void {
    this.messages = messages.map(msg => this.sanitizer.bypassSecurityTrustHtml(msg));
  }

  subscribeToUpload(): void {
    this.uploading$.pipe(
      skip(1),
      takeUntil(this.ngUnSubscribe$),
    ).subscribe((uploading: boolean) => {
      this.uploading = uploading;
      if (!uploading) {
        this.progressStyle = '100%';
      }
    });
  }

  public close(): void {
    this.modalWindow.hide();
  }

  get status(): string {
    return this.validationResult.status === W9ValidationStatus.Error
      ? 'Error'
      : 'Success';
  }

  ngOnDestroy(): void {
    this.ngUnSubscribe$.next();
    this.ngUnSubscribe$.complete();
  }
}
