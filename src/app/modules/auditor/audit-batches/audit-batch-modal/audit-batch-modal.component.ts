/* eslint-disable no-restricted-globals */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil, filter, first } from 'rxjs/operators';
import { ToastService } from '@app/services';
import { AuditBatchStage, AuditBatchUploading } from '@app/models/enums';
import { PreviewStatus } from '@app/models/auditor/preview-status.enum';
import { sharedActions } from '@app/modules/shared/state';
import { DownloadDocument } from '@app/modules/shared/state/upload-bulk-document/actions';
import { AuditRun } from '@app/models/auditor/audit-run';
import * as auditBatchModalActions from './state/actions';

import { auditBatchModalSelectors } from './state/selectors';

import { AuditorState } from '../../state/reducer';

@Component({
  selector: 'app-audit-batch-modal',
  templateUrl: './audit-batch-modal.component.html',
  styleUrls: ['./audit-batch-modal.component.scss'],
})
export class AuditBatchModalComponent implements OnInit, OnDestroy {
  private ngUnsubscribe$ = new Subject<void>();

  public errorMessage$ = this.store.select(auditBatchModalSelectors.error);
  private stage$ = this.store.select(auditBatchModalSelectors.stage);
  private previewStatus$ = this.store.select(auditBatchModalSelectors.previewStatus);
  private auditRun$ = this.store.select(auditBatchModalSelectors.auditRun);
  public isClosingDisabled$ = this.store.select(auditBatchModalSelectors.isClosingDisabled);

  readonly awaitedRunAditorActionTypes = [
    auditBatchModalActions.Error.type,
    auditBatchModalActions.ShowAuditResults,
  ];

  public stage: AuditBatchStage;
  public previewStatus: PreviewStatus;
  public auditRun: AuditRun;

  public isValidTemplate: boolean;
  public isValidUpload: boolean;
  public isApproveAvailable: boolean;
  public isAuditResultAvailable: boolean;
  public isAuditPreviewAvailable: boolean;
  public isOriginalFileAvailable: boolean;
  public canRerun: boolean;
  public statusMessage: string;

  readonly stages = AuditBatchStage;
  readonly previewStatuses = PreviewStatus;

  constructor(
    public auditBatchModal: BsModalRef,
    private readonly store: Store<AuditorState>,
    private toaster: ToastService,
  ) {
  }

  ngOnInit() {
    if (!!this.auditRun?.id && !!this.auditRun?.resultDocument?.id) {
      this.store.dispatch(auditBatchModalActions.ShowAuditResults({ auditRun: this.auditRun }));
    }
    else if(this.auditRun?.runStatusId == AuditBatchUploading.Failed) {
      this.store.dispatch(auditBatchModalActions.ShowAuditFailed({ auditRun: this.auditRun }));
    }

    this.initValues();
  }

  private initValues(): void {
    this.stage$.pipe(
      filter(state => !!state),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(stage => {
      this.stage = stage;
    });

    this.previewStatus$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(result => {
      this.previewStatus = result;
    });

    this.auditRun$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(auditRun => {
      this.auditRun = auditRun;
      this.isValidTemplate = !!auditRun?.auditDocImportTemplate?.documentImportTemplateId;
      this.isValidUpload = !!auditRun?.inputDocument?.fileContent;
      this.isApproveAvailable = !!auditRun && auditRun.isPreview && (auditRun.counts?.total !== 0);
      this.isAuditResultAvailable = !!auditRun && !!auditRun.resultDocument?.id;
      this.isOriginalFileAvailable = !!auditRun && !!auditRun.inputDocument?.id;
      this.isAuditPreviewAvailable = !!auditRun && !!auditRun.previewDocument?.id;
      this.canRerun = !!auditRun;
      this.statusMessage = auditRun?.statusMessage;
    });
  }

  public onClose(): void {
    this.isClosingDisabled$
      .pipe(first())
      .subscribe(isDisabled => {
        if (!isDisabled) {
          if (this.previewStatus !== PreviewStatus.None) {
            this.store.dispatch(auditBatchModalActions.RefreshAuditRunGrid());
          }
          this.auditBatchModal.hide();
        } else {
          this.toaster.showWarning('Audit Batch file is loading and can\'t be interrupted.');
        }
      });
  }

  public onBack(): void {
    this.store.dispatch(auditBatchModalActions.SetModalStage({ incr: -1 }));
  }

  public moveToNextStep() {
    this.store.dispatch(auditBatchModalActions.SetModalStage({ incr: 1 }));
  }

  public onNext(): void {
    if (!this.isValidTemplate) {
      return;
    }

    this.moveToNextStep();
  }

  public downloadTemplate(): void {
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.DownloadTemplate({ id: this.auditRun.auditDocImportTemplate.documentImportTemplateId }));
  }

  public downloadAuditResults(): void {
    this.store.dispatch(DownloadDocument({ id: this.auditRun.resultDocument.id }));
  }

  public downloadAuditPreview(): void {
    this.store.dispatch(DownloadDocument({ id: this.auditRun.previewDocument.id }));
  }

  public downloadOriginalFile(): void {
    this.store.dispatch(DownloadDocument({ id: this.auditRun.inputDocument.id }));
  }

  public onRunPreview(): void {
    this.store.dispatch(auditBatchModalActions.StartPreview());
  }

  public onApprove(): void {
    this.store.dispatch(auditBatchModalActions.SubmitApproveRequest());
  }

  public onRerun(): void {
    this.store.dispatch(auditBatchModalActions.StartRerun());
  }

  ngOnDestroy() {
    this.store.dispatch(auditBatchModalActions.ResetAuditBatchModalState());

    this.auditBatchModal?.hide();
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
