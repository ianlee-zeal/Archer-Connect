/* eslint-disable no-restricted-globals */
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActionsSubject, Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject, takeUntil } from 'rxjs';

import { ProjectsCommonState } from '@app/modules/projects/state/reducer';
import { ToastService } from '@app/services';
import { EntityTypeEnum, GeneratePaymentRequestStage } from '@app/models/enums';
import * as commonActions from '@app/modules/shared/state/common.actions';
import * as batchActions from '@app/modules/projects/state/actions';
import { PaymentRequest } from '@app/models';
import { ISearchOptions } from '@app/models/search-options';
import * as batchSelectors from '@app/modules/projects/state/selectors';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { AttachmentForm } from '@app/modules/shared/_abstractions/attachment-form';
import { sharedSelectors } from '@app/modules/shared/state/index';
import { RequestReviewOption } from '@app/models/payment-request/payment-request-review-result';
import { GridPusherMessage } from '@app/models/documents/grid-pusher-message';
import { BatchAction } from '@app/models/batch-action/batch-action';
import { TransferRequestDto } from '@app/models/transfer-request/transfer-review-dto';
import { ProgressValuesPusherChannel } from '@app/models/file-imports/progress-values-with-channel';
import * as actions from '../../state/actions';
import { TransferConfigStepComponent } from './steps/transfer-config-step/transfer-config-step.component';
import { TransfersReviewStepComponent } from './steps/transfers-review-step/transfers-review-step.component';
import { TransfersDeficiencySummaryComponent } from './steps/transfers-deficiency-summary/transfers-deficiency-summary.component';
import { TransferResultStepComponent } from './steps/transfer-result-step/transfer-result-step.component';
import * as projectActions from '@app/modules/projects/state/actions';
import { ofType } from '@ngrx/effects';

export interface IGenerateTransferRequestModalInitialState {
  projectId: number;
  searchOptions: ISearchOptions;
  transferRequestEntityType: EntityTypeEnum;
  isGlobal?: boolean;
  modalType?: EntityTypeEnum;
}

@Component({
  selector: 'app-generate-transfer-request-modal',
  templateUrl: './generate-transfer-request-modal.component.html',
  styleUrls: ['./generate-transfer-request-modal.component.scss'],
})
export class GenerateTransferRequestModalComponent extends AttachmentForm implements OnInit, OnDestroy {
  private ngUnsubscribe$ = new Subject<void>();

  @ViewChild(TransferConfigStepComponent)
  readonly paymentTypesConfigStep: TransferConfigStepComponent;

  @ViewChild(TransfersReviewStepComponent)
  readonly paymentsReviewStep: TransfersReviewStepComponent;

  @ViewChild(TransfersDeficiencySummaryComponent)
  readonly paymentsDeficiencySummaryStep: TransfersDeficiencySummaryComponent;

  @ViewChild(TransferResultStepComponent)
  readonly paymentsResultsStepComponent: TransferResultStepComponent;

  readonly isPaymentRequestInProgress$ = this.store.select(batchSelectors.isPaymentRequestInProgress);

  // initial state passed to modal ---
  transferRequestEntityType: EntityTypeEnum;
  projectId: number;
  searchOptions: ISearchOptions;
  isGlobal?: boolean;
  modalType?: EntityTypeEnum;
  // ---------------------------------

  request: PaymentRequest;
  transferRequestResult: GridPusherMessage;
  selectedTransferIds: string[];

  stage = GeneratePaymentRequestStage.PaymentTypeConfig;

  public form = new UntypedFormGroup({ note: new UntypedFormControl(null, Validators.required) });

  readonly stages = GeneratePaymentRequestStage;

  public allowedExtensions$ = this.store.select(sharedSelectors.commonSelectors.allowedFileExtensions);

  public batchActionId: number;
  public transferRequestId: number;
  public pusherChannelName: string;

  readonly batchActionData$ = this.store.select(batchSelectors.batchActionData);
  readonly transferRequest$ = this.store.select(batchSelectors.transferRequest);

  readonly awaitedActionTypesForConfig = [
    batchActions.GeneratePaymentRequestJobFailed.type,
    batchActions.GeneratePaymentRequestJobSuccess.type,
    batchActions.GenerateTransferRequestJobSuccess.type,
    batchActions.GenerateTransferRequestJobFailed.type,
    batchActions.Error.type,
    actions.Error.type,
    commonActions.FormInvalid.type,
  ];

  readonly awaitedActionTypesForReview = [
    batchActions.AcceptPaymentRequestJobFailed.type,
    batchActions.AcceptPaymentRequestJobSuccess.type,
    batchActions.Error.type,
    actions.Error.type,
    commonActions.FormInvalid.type,
  ];

  readonly awaitedActionTypesForReviewWarnings = [
    batchActions.Error.type,
    actions.Error.type,
    commonActions.FormInvalid.type,
  ];

  public get isValidAttachment(): boolean {
    return true;
  }
  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  get valid(): boolean {
    switch (this.stage) {
      case GeneratePaymentRequestStage.PaymentTypeConfig:
        return !this.paymentTypesConfigStep || this.paymentTypesConfigStep.valid;
      case GeneratePaymentRequestStage.ReviewPayments:
        return (!this.paymentsReviewStep || this.paymentsReviewStep.valid) && this.form.valid;
      case GeneratePaymentRequestStage.ReviewDeficiencies:
        return !this.paymentsDeficiencySummaryStep
        || (this.paymentsDeficiencySummaryStep
          && !this.paymentsDeficiencySummaryStep.loadingWarningData
          && this.paymentsDeficiencySummaryStep.paymentRequesDeficiencies.filter((i: RequestReviewOption) => !i.severe).every((i: RequestReviewOption) => i.bypass?.trim()));
      default:
        return true;
    }
  }

  get isPaymentTypeConfigStage(): boolean {
    return this.stage === GeneratePaymentRequestStage.PaymentTypeConfig;
  }

  get isReviewWarningsStage(): boolean {
    return this.stage === GeneratePaymentRequestStage.ReviewDeficiencies;
  }

  get showDownloadDeficiencyDetails(): boolean {
    return this.stage === GeneratePaymentRequestStage.ReviewDeficiencies && this.paymentTypesConfigStep?.reviewLogDocId != null;
  }

  constructor(
    private readonly modal: BsModalRef,
    private readonly store: Store<ProjectsCommonState>,
    private readonly toaster: ToastService,
    private readonly actionsSubj: ActionsSubject,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.store.dispatch(commonActions.GetMimeTypes());
    this.batchActionData$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((data: BatchAction) => {
      if (data) {
        this.batchActionId = data.id;
        this.pusherChannelName = data.channelName;
      }
    });
    this.transferRequest$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((data: TransferRequestDto) => {
      if (data) {
        this.transferRequestId = data.id;
      }
    });
    this.actionsSubj.pipe(
      ofType(projectActions.GetTransferRequestSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(val => {
      this.paymentTypesConfigStep.reviewLogDocId = val.transferRequest.reviewOptionsDocId;
    });
  }

  onSubmit(): void {
    switch (this.stage) {
      case GeneratePaymentRequestStage.PaymentTypeConfig:
        this.paymentTypesConfigStep.submit();
        break;
      case GeneratePaymentRequestStage.ReviewDeficiencies:
        this.paymentsDeficiencySummaryStep.submit();
        break;
      case GeneratePaymentRequestStage.ReviewPayments:
        this.paymentsReviewStep.submit();
        break;
    }
  }

  onClose(): void {
    this.store.dispatch(batchActions.ClearPaymentRequest());
    this.modal.hide();
  }

  onPaymentTypesConfigurationFinished(request: PaymentRequest): void {
    this.stage = GeneratePaymentRequestStage.ReviewDeficiencies;
    this.request = request;
  }

  onTransferTypesConfigurationFinished(message: GridPusherMessage): void {
    this.stage = GeneratePaymentRequestStage.ReviewDeficiencies;
    this.transferRequestResult = message;
  }

  onPaymentsReviewWarningsFinished(request: PaymentRequest): void {
    this.reviewFinished();
    this.store.dispatch(batchActions.GetPaymentRequestData({
      projectId: this.projectId,
      paymentRequestId: request.Id,
      documentId: request.ProcessDocId,
    }));
  }

  onTransferReviewDeficienciesFinished(): void {
    this.reviewFinished();
  }

  private reviewFinished(): void {
    this.stage = GeneratePaymentRequestStage.ReviewPayments;
    this.store.dispatch(batchActions.IsPaymentRequestInProgress({ isPaymentRequestInProgress: false }));
  }

  onPaymentTypesConfigurationWarning(request: PaymentRequest): void {
    this.request = request;
  }

  onPaymentTypesConfigurationFailed(error: string): void {
    this.toaster.showError(`Payment request configuration failed: ${error}`);
  }

  onPaymentsReviewFinished(): void {
    this.stage = GeneratePaymentRequestStage.Result;
    this.toaster.showSuccess('Payment request submitted successfully.');
    this.store.dispatch(batchActions.IsPaymentRequestInProgress({ isPaymentRequestInProgress: false }));
  }

  onTransferReviewFinished(selectedTransferIds: string[]): void {
    this.selectedTransferIds = selectedTransferIds;
    this.stage = GeneratePaymentRequestStage.Result;
    this.toaster.showSuccess('Transfer request submitted successfully.');
    this.store.dispatch(batchActions.IsPaymentRequestInProgress({ isPaymentRequestInProgress: false }));
  }

  onPaymenReviewWarningsFailed(error: string): void {
    this.toaster.showError(`Payment request review failed: ${error}`);
  }

  onPaymentsReviewFailed(error: string): void {
    this.toaster.showError(`Payment request submit failed: ${error}`);
  }

  public onBack(): void {
    this.request = null;
    this.stage -= 1;
    this.store.dispatch(batchActions.UpdateProgressBarData({ progressBarData: ProgressValuesPusherChannel.initialState(this.pusherChannelName) }));
  }

  public downloadFile(): void {
    if (!this.paymentsReviewStep?.processLogDocId
      && !this.paymentTypesConfigStep?.reviewLogDocId
      && !this.paymentsResultsStepComponent?.processLogDocId) {
      return;
    }
    let docId: number;
    switch (this.stage) {
      case GeneratePaymentRequestStage.ReviewPayments:
        docId = this.paymentsReviewStep?.processLogDocId;
        break;
      case GeneratePaymentRequestStage.ReviewDeficiencies:
        docId = this.paymentTypesConfigStep.reviewLogDocId;
        break;
      case GeneratePaymentRequestStage.Result:
        docId = this.paymentsResultsStepComponent?.processLogDocId;
        break;
    }
    this.store.dispatch(batchActions.DownloadDocument({ id: docId }));
  }

  getAwaitedActionTypes(): string[] {
    if (this.isPaymentTypeConfigStage) {
      return this.awaitedActionTypesForConfig;
    }
    if (this.isReviewWarningsStage) {
      return this.awaitedActionTypesForReviewWarnings;
    }
    return this.awaitedActionTypesForReview;
  }

  ngOnDestroy(): void {
    this.store.dispatch(batchActions.ClearProgressBarData());
    this.store.dispatch(batchActions.ClearTransferData());
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
