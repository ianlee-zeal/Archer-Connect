/* eslint-disable no-restricted-globals */
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActionsSubject, Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject, takeUntil } from 'rxjs';

import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { CurrencyHelper, StringHelper } from '@app/helpers';
import { BatchActionHelper } from '@app/helpers/batch-action.helper';
import { BatchAction, BatchActionDto } from '@app/models/batch-action/batch-action';
import { GridPusherMessage } from '@app/models/documents/grid-pusher-message';
import { EntityTypeEnum, FileImportReviewTabs, JobNameEnum, RefundTransferStep } from '@app/models/enums';
import { BatchActionStatus } from '@app/models/enums/batch-action/batch-action-status.enum';
import { BatchActionTemplate } from '@app/models/enums/batch-action/batch-action-template.enum';
import { FileImportTab } from '@app/models/file-imports';
import { RefundTransferConfig } from '@app/models/refund-transfer-request/refund-transfer-config';
import * as batchActions from '@app/modules/projects/state/actions';
import { ProjectsCommonState } from '@app/modules/projects/state/reducer';
import * as batchSelectors from '@app/modules/projects/state/selectors';
import { AttachmentForm } from '@app/modules/shared/_abstractions/attachment-form';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import * as commonActions from '@app/modules/shared/state/common.actions';
import * as exportsActions from '@app/modules/shared/state/exports/actions';
import { ToastService } from '@app/services';
import { LogService } from '@app/services/log-service';
import { PusherService } from '@app/services/pusher.service';
import { ofType } from '@ngrx/effects';
import { Channel } from 'pusher-js';
import * as actions from '../state/actions';
import { ManualEntryStepComponent } from './steps/manual-entry-step/manual-entry-step.component';
import { RefundTransferRequestFormStepComponent } from './steps/request-form-step/request-form-step.component';
import { RefundTransferRequestResultStepComponent } from './steps/result-step/refund-transfer-request-result-step.component';
import { RefundTransferRequestReviewStepComponent } from './steps/review-step/refund-transfer-request-review-step.component';

export interface IRefundTransferRequestModalInitialState {
  projectId: number;
  transferFromOrgId: number;
  transferToOrgId: number;
  transferFromAccountId: number;
  transferToAccountId: number;
}

@Component({
  selector: 'app-refund-transfer-request-modal',
  templateUrl: './refund-transfer-request-modal.component.html',
  styleUrls: ['./refund-transfer-request-modal.component.scss'],
})
export class RefundTransferRequestModalComponent extends AttachmentForm implements OnInit, OnDestroy {
  private pusherChannel: Channel;
  private ngUnsubscribe$ = new Subject<void>();
  public validationResultDocId: number;
  public loadingResultDocId: number;
  public refundInfo = {
    projectName: '',
    toQsf: '',
    fromAccount: '',
    amount: '$0.00'
  };

  @ViewChild(RefundTransferRequestFormStepComponent)
  readonly requestFormComponent: RefundTransferRequestFormStepComponent;

  @ViewChild(ManualEntryStepComponent)
  readonly manualEntryFormComponent: ManualEntryStepComponent;

  @ViewChild(RefundTransferRequestReviewStepComponent)
  readonly reviewComponent: RefundTransferRequestReviewStepComponent;

  @ViewChild(RefundTransferRequestResultStepComponent)
  readonly resultComponent: RefundTransferRequestResultStepComponent;

  readonly isPaymentRequestInProgress$ = this.store.select(batchSelectors.isPaymentRequestInProgress);

  transferRequestResult: GridPusherMessage;

  stage = RefundTransferStep.RequestForm;

  public form = new UntypedFormGroup({ note: new UntypedFormControl(null, Validators.required) });

  readonly stages = RefundTransferStep;

  public batchActionId: number;
  public batchAction: BatchAction;
  public transferRequestId: number;
  public pusherChannelName: string;
  public tabsGroup: FileImportTab[];
  public errorMessage: string;
  public refundTransferConfig: RefundTransferConfig;
  public additionalManualEntryDocumentsFiles: File[];

  readonly batchActionData$ = this.store.select(batchSelectors.batchActionData);

  readonly awaitedActionTypesForConfig = [
    actions.Error.type,
    commonActions.FormInvalid.type,
  ];

  readonly awaitedActionTypesForForm = [
    actions.Error.type,
    commonActions.FormInvalid.type,
    actions.ProcessBatchActionCompleted,
    actions.ProcessBatchActionError,
  ];

  readonly awaitedActionTypesForReview = [
    actions.Error.type,
    commonActions.FormInvalid.type,
    actions.PostloadBatchActionCompleted,
    actions.PostloadBatchActionError,
  ];

  readonly awaitedActionTypesForReviewWarnings = [
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
      case RefundTransferStep.RequestForm:
        return true;
      case RefundTransferStep.ManualEntry:
        return this.form.valid;
      case RefundTransferStep.Review:
        return true;
      default:
        return true;
    }
  }

  get isRequestFormStageNextBtnEnabled(): boolean {
    return (this.isRequestFormStage && this.requestFormComponent?.claimantAndDetailsFile != null && this.requestFormComponent.requestForm.valid)
    || (this.isManualEntryStage && this.manualEntryFormComponent?.form?.valid);
  }

  get isReviewStageSubmitBtnEnabled(): boolean {
    return this.isReviewStage
      && this.reviewComponent != null
      && this.reviewComponent.form.valid
      && this.batchAction?.countSuccessful > 0
      && !(this.reviewComponent.activeTab == FileImportReviewTabs.Errors || this.reviewComponent.activeTab == FileImportReviewTabs.Warnings);
  }

  get isRequestFormStage(): boolean {
    return this.stage === RefundTransferStep.RequestForm;
  }

  get isManualEntryStage(): boolean {
    return this.stage === RefundTransferStep.ManualEntry;
  }

  get isReviewStage(): boolean {
    return this.stage === RefundTransferStep.Review;
  }

  get isResultStage(): boolean {
    return this.stage === RefundTransferStep.Result;
  }

  get isShowPreviewFileBtn(): boolean {
    return (this.isReviewStage || this.isResultStage) && this.validationResultDocId > 0;
  }

  constructor(
    private readonly modal: BsModalRef,
    private readonly store: Store<ProjectsCommonState>,
    private readonly toaster: ToastService,
    private readonly actionsSubj: ActionsSubject,
    private readonly pusherService: PusherService,
    private readonly enumToArray: EnumToArrayPipe,
    private readonly logger: LogService,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.store.dispatch(commonActions.GetMimeTypes());
    this.actionsSubj.pipe(
      ofType(actions.ProcessBatchActionSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(data => {
      if (data) {
        this.batchActionId = data.batchAction.id;
        this.batchAction = data.batchAction;
        this.pusherChannelName = data.batchAction.channelName;
      }
    });

    this.actionsSubj.pipe(
      ofType(actions.PostloadBatchActionError),
      ofType(actions.ProcessBatchActionError),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(action => {
      this.errorMessage = action.errorMessage;
    });

    this.actionsSubj.pipe(
      ofType(actions.GetRefundTransferRequestInfoSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(action => {
      this.refundInfo.amount = CurrencyHelper.toUsdIfNumber({value: action.amount});
      this.batchAction.countTotal = action.validationResults.totalCount;
      this.batchAction.countErrored = action.validationResults.errorCount;
      this.batchAction.countWarned = action.validationResults.warningCount;
      this.batchAction.countSuccessful = action.validationResults.enqueuedCount;
      this.tabsGroup = BatchActionHelper.generateReviewTabsGroup(this.batchAction);
    });
  }

  ngAfterViewInit(): void {
    if (this.requestFormComponent) {
      this.requestFormComponent.addManuallyClicked.subscribe(() => {
        this.handleAddManuallyClicked();
      });
    }
  }

  private handleAddManuallyClicked(): void {
    this.setConfig();
    this.additionalManualEntryDocumentsFiles = this.requestFormComponent.additionalDocumentsFiles;
    this.stage = this.stages.ManualEntry;
  }

  onSubmit(): void {
    switch (this.stage) {
      case RefundTransferStep.RequestForm:
        this.onValidateClick();
        break;
      case RefundTransferStep.ManualEntry:
        this.onManualEntryValidateClick();
        break;
      case RefundTransferStep.Review:
        this.onSubmitClick();
        break;
    }
  }

  public onValidateClick(): void {
    this.setupTransferInfo();
    this.unsubscribePusherChannel();
    this.pusherChannelName = StringHelper.generateChannelName(JobNameEnum.RefundTransferRequest);
    this.pusherChannel = this.pusherService.subscribeChannel(
      this.pusherChannelName,
      this.enumToArray.transform(BatchActionStatus).map((i: { id: number; name: string }) => i.name),
      this.validationChannelEventHandler.bind(this),
      this.enqueueValidation.bind(this, this.pusherChannelName),
    );
  }

  private validationChannelEventHandler(data: any, event: string): void {
    switch (BatchActionStatus[event]) {
      case BatchActionStatus.Complete: {
        this.store.dispatch(exportsActions.SetActionStatus({ isActionInProgress: false }));
        this.store.dispatch(actions.GetRefundTransferRequestInfo({ batchActionId: this.batchAction.id }));
        this.validationResultDocId = data.PreviewDocId;
        this.stage = RefundTransferStep.Review;
        break;
      }
      case BatchActionStatus.Error:
        this.store.dispatch(exportsActions.SetActionStatus({ isActionInProgress: false }));
        this.logger.log('[validationChannelEventHandler]', data);
        this.store.dispatch(actions.ProcessBatchActionError({ errorMessage: data.ErrorMessage, bsModalRef: this.modal }));
        break;
      default:
        break;
    }
  }

  private enqueueValidation(channelName: string): void {
    this.setConfig();
    const batchAction: BatchActionDto = {
      entityTypeId: EntityTypeEnum.Projects,
      entityId: this.refundTransferConfig.projectId,
      batchActionFilters: [{filter: JSON.stringify({})}],
      pusherChannelName: channelName,
      batchActionTemplateId: BatchActionTemplate.RefundTransferRequest,
      config: JSON.stringify(this.refundTransferConfig),
    };
    this.store.dispatch(exportsActions.SetActionStatus({ isActionInProgress: true }));
    this.store.dispatch(actions.ValidateRefundTransferRequest({
      batchAction,
      claimantAndDetailsFile: this.requestFormComponent.claimantAndDetailsFile,
      additionalDocumentsFiles: this.requestFormComponent.additionalDocumentsFiles
    }));
  }

  private setConfig(): void {
    this.refundTransferConfig = Object.assign(new RefundTransferConfig(), {
      projectId: this.requestFormComponent.projectId,
      orgIdFrom: this.requestFormComponent.transferFromOrgControl.value,
      orgIdTo: this.requestFormComponent.transferToOrgControl.value,
      bankAccountIdFrom: this.requestFormComponent.transferFromAccountControl.value,
      bankAccountIdTo: this.requestFormComponent.transferToAccountControl.value,
    });
  }

  public onManualEntryValidateClick(): void {
    this.setupTransferInfo();
    this.unsubscribePusherChannel();
    const channelName = StringHelper.generateChannelName(JobNameEnum.RefundTransferRequest);
    this.pusherChannel = this.pusherService.subscribeChannel(
      channelName,
      this.enumToArray.transform(BatchActionStatus).map((i: { id: number; name: string }) => i.name),
      this.validationChannelEventHandler.bind(this),
      this.enqueueManualEntryValidation.bind(this, channelName),
    );
  }

  private enqueueManualEntryValidation(channelName: string): void {
    const batchAction: BatchActionDto = {
      entityTypeId: EntityTypeEnum.Projects,
      entityId: this.refundTransferConfig.projectId,
      batchActionFilters: [{ filter: JSON.stringify({}) }],
      pusherChannelName: channelName,
      batchActionTemplateId: BatchActionTemplate.RefundTransferRequest,
      config: JSON.stringify(this.refundTransferConfig),
    };
    this.store.dispatch(exportsActions.SetActionStatus({ isActionInProgress: true }));
    this.store.dispatch(actions.ValidateManualEntryRefundTransferRequest({
      batchAction,
      items: this.manualEntryFormComponent.getEntriesAsItems(),
      additionalDocumentsFiles: this.additionalManualEntryDocumentsFiles,
    }));
  }

  public onSubmitClick(): void {
    this.unsubscribePusherChannel();
    this.store.dispatch(exportsActions.SetActionStatus({ isActionInProgress: true }));
    this.pusherChannel = this.pusherService.subscribeChannel(
      this.pusherChannelName,
      this.enumToArray.transform(BatchActionStatus).map((i: { id: number; name: string }) => i.name),
      this.resultsChannelEventHandler.bind(this),
      this.refundTransferRequestSubmit.bind(this),
    );
  }

  private resultsChannelEventHandler(data: any, event: string): void {
    switch (BatchActionStatus[event]) {
      case BatchActionStatus.Complete: {
        this.store.dispatch(exportsActions.SetActionStatus({ isActionInProgress: false }));
        this.loadingResultDocId = data.ResultDocId;
        this.store.dispatch(actions.PostloadBatchActionCompleted());
        this.stage = RefundTransferStep.Result;
        break;
      }
      case BatchActionStatus.Error:
        this.store.dispatch(exportsActions.SetActionStatus({ isActionInProgress: false }));
        this.logger.log('[resultsChannelEventHandler]', data);
        this.store.dispatch(actions.PostloadBatchActionError({ errorMessage: data.ErrorMessage, bsModalRef: this.modal }));
        break;
      default:
        break;
    }
  }

  private refundTransferRequestSubmit(): void {
    this.store.dispatch(actions.LoadBatchAction({ batchActionId: this.batchAction.id }));
  }

  onClose(): void {// TODO
    this.modal.hide();
  }

  public onBack(): void {
    this.stage -= 1;
  }

  public onAddManuallyClick(): void {
    this.stage = RefundTransferStep.ManualEntry;
  }

  public downloadFile(): void {
    if (!this.validationResultDocId) {
      return;
    }
    let docId: number;
    switch (this.stage) {
      case this.stages.Review:
        docId = this.validationResultDocId;
        break;
      case this.stages.Result:
        docId = this.validationResultDocId;
        break;
    }
    this.store.dispatch(batchActions.DownloadDocument({ id: docId }));
  }

  private setupTransferInfo(): void {
    this.refundInfo.projectName = this.requestFormComponent?.projectName;
    this.refundInfo.toQsf = this.requestFormComponent?.transferToOrgName;
    this.refundInfo.fromAccount = this.requestFormComponent?.transferFromAccount;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  unsubscribePusherChannel(): void {
    if (this.pusherChannel) {
      this.pusherService.unsubscribeChannel(this.pusherChannel);
    }
  }
}
