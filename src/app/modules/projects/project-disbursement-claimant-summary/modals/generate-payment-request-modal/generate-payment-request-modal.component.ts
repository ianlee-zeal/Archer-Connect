/* eslint-disable no-restricted-globals */
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';

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
import * as actions from '../../state/actions';
import { PaymentTypesConfigStepComponent } from './steps/payment-types-config-step/payment-types-config-step.component';
import { PaymentsReviewStepComponent } from './steps/payments-review-step/payments-review-step.component';
import { PaymentsDeficiencySummaryComponent } from './steps/payments-deficiency-summary/payments-deficiency-summary.component';
import { PaymentsResultsStepComponent } from './steps/payments-results-step/payments-results-step.component';
import { TopPaymentRequstProgressBarComponent } from './top-progress-bar/top-progress-bar.component';

export interface IGeneratePaymentRequestModalInitialState {
  projectId: number;
  searchOptions: ISearchOptions;
  paymentRequestEntityType: EntityTypeEnum;
  isGlobal?: boolean;
}

@Component({
  selector: 'app-generate-payment-request-modal',
  templateUrl: './generate-payment-request-modal.component.html',
  styleUrls: ['./generate-payment-request-modal.component.scss'],
})
export class GeneratePaymentRequestModalComponent extends AttachmentForm implements OnInit, OnDestroy {
  private ngUnsubscribe$ = new Subject<void>();

  @ViewChild(PaymentTypesConfigStepComponent)
  readonly paymentTypesConfigStep: PaymentTypesConfigStepComponent;

  @ViewChild(PaymentsReviewStepComponent)
  readonly paymentsReviewStep: PaymentsReviewStepComponent;

  @ViewChild(PaymentsDeficiencySummaryComponent)
  readonly paymentsDeficiencySummaryStep: PaymentsDeficiencySummaryComponent;

  @ViewChild(PaymentsResultsStepComponent)
  readonly paymentsResultsStepComponent: PaymentsResultsStepComponent;

  @ViewChild(TopPaymentRequstProgressBarComponent)
  readonly topPaymentRequestProgressBarComponent: TopPaymentRequstProgressBarComponent;

  readonly isPaymentRequestInProgress$ = this.store.select(batchSelectors.isPaymentRequestInProgress);

  // initial state passed to modal ---
  paymentRequestEntityType: EntityTypeEnum;
  projectId: number;
  searchOptions: ISearchOptions;
  isGlobal?: boolean;
  // ---------------------------------

  request: PaymentRequest;

  stage = GeneratePaymentRequestStage.PaymentTypeConfig;

  public form = new UntypedFormGroup({ note: new UntypedFormControl(null, Validators.required) });

  readonly stages = GeneratePaymentRequestStage;

  public allowedExtensions$ = this.store.select(sharedSelectors.commonSelectors.allowedFileExtensions);

  readonly awaitedActionTypesForConfig = [
    batchActions.GeneratePaymentRequestJobFailed.type,
    batchActions.GeneratePaymentRequestJobSuccess.type,
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

  constructor(
    private readonly modal: BsModalRef,
    private readonly store: Store<ProjectsCommonState>,
    private readonly toaster: ToastService,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.store.dispatch(commonActions.GetMimeTypes());
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

  onPaymentsReviewWarningsFinished(request: PaymentRequest): void {
    this.stage = GeneratePaymentRequestStage.ReviewPayments;
    this.store.dispatch(batchActions.IsPaymentRequestInProgress({ isPaymentRequestInProgress: false }));
    this.store.dispatch(batchActions.GetPaymentRequestData({
      projectId: this.projectId,
      paymentRequestId: request.Id,
      documentId: request.ProcessDocId,
    }));
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

  onPaymenReviewWarningsFailed(error: string): void {
    this.toaster.showError(`Payment request review failed: ${error}`);
  }

  onPaymentsReviewFailed(error: string): void {
    this.toaster.showError(`Payment request submit failed: ${error}`);
  }

  public onBack(): void {
    this.request = null;
    this.stage -= 1;
  }

  public downloadFile(): void {
    if (!this.paymentsReviewStep?.processLogDocId && !this.paymentTypesConfigStep.reviewLogDocId) {
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
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
