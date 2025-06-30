import { Component, OnDestroy, OnInit } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { Subject } from "rxjs";
import { DocumentBatchState } from "../state/reducer";
import { Store } from "@ngrx/store";
import * as selectors from "../state/selectors";
import * as documentBatchActions from "../state/actions";
import { takeUntil } from "rxjs/operators";
import { UploadTask } from "@app/models/document-batch-upload/upload-batch/upload-task";
import { ToastService } from "@app/services";


@Component({
  selector: 'app-document-batch-modal',
  templateUrl: './document-batch-modal.component.html',
  styleUrls: ['./document-batch-modal.component.scss'],
})
export class DocumentbatchModalComponent implements OnInit, OnDestroy {
  batchId: number;
  selectedFiles: File[] = [];
  uploadTask$ = this.store.select(selectors.documentUploadTask);
  uploadTask: UploadTask;
  didCancelRequestSucceed$ = this.store.select(selectors.cancelUploadSucceeded);

  ngUnSubscribe$ = new Subject<void>();
  constructor(
    private toaster: ToastService,
    private store: Store<DocumentBatchState>,
    private modalWindow: BsModalRef,
  ) { }

  ngOnInit(): void {
    this.subscribeToUploadTask();
    this.subscribeToUploadFailure();
  }

  public complete(): void {
    this.toaster.showSuccess('Batch created successfully');
    this.store.dispatch(documentBatchActions.completeUploadTask());
    this.modalWindow.hide();
  }

  public cancel(): void {
    this.toaster.showWarning('Batch creation cancelled');
    this.store.dispatch(documentBatchActions.cancelUploadRequest({ batchId: this.uploadTask.batchId }));
    this.didCancelRequestSucceed$.pipe(
      takeUntil(this.ngUnSubscribe$),
    ).subscribe(didSucceed => {
      if (didSucceed) {
        this.modalWindow.hide();
      }
    });
  }

  public close(): void {
    if (this.uploadTask && this.uploadTask.isUploading) {
      this.cancel();
    } else {
      this.complete();
    }
  }

  getProgressBarWidth(): string {
    if (this.uploadTask) {
      const percentage = (this.uploadTask.totalUploaded / this.uploadTask.totalFiles) * 100;
      return `${percentage}%`;
    }
    return '0%';
  }

  subscribeToUploadTask(): void {
    this.uploadTask$.pipe(
      takeUntil(this.ngUnSubscribe$),
    ).subscribe(task => {
      this.uploadTask = { ...task };
    });
  }

  subscribeToUploadFailure(): void {

    this.store.select(selectors.uploadTaskHasError).pipe(
      takeUntil(this.ngUnSubscribe$),
    ).subscribe(hasError => {
      if (hasError) {
        this.toaster.showError('An error occurred while uploading the files. Please try again.');
        this.store.dispatch(documentBatchActions.cancelUploadRequest({ batchId: this.uploadTask.batchId }));
        this.modalWindow.hide();
      }

    });

  }

  ngOnDestroy(): void {
    this.store.dispatch(documentBatchActions.reset());
    this.ngUnSubscribe$.next();
    this.ngUnSubscribe$.complete();
  }
}