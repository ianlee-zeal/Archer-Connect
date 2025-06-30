import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { CommonHelper, StringHelper } from '@app/helpers';
import { Project } from '@app/models';
import { DocumentImport, Job } from '@app/models/documents';
import { GridPusherMessage } from '@app/models/documents/grid-pusher-message';
import { DocumentImportLoading, EntityTypeEnum, FileImportDocumentType, FileImportReviewTabs, JobNameEnum } from '@app/models/enums';
import { DocumentImportTemplate } from '@app/models/enums/document-import-template.enum';
import { ManualPaymentRequestStage } from '@app/models/enums/manual-payment-request.enum';
import { FileImportTab } from '@app/models/file-imports';
import * as fromOrgs from '@app/modules/admin/user-access-policies/orgs/state';
import * as batchActions from '@app/modules/projects/state/actions';
import * as commonActions from '@app/modules/shared/state/common.actions';
import { LoadingIndicatorService } from '@app/services/loading-indicator.service';
import { PusherService } from '@app/services/pusher.service';
import { ofType } from '@ngrx/effects';
import { ActionsSubject, Store } from '@ngrx/store';
import { Channel } from 'pusher-js';
import { filter, Subject, takeUntil } from 'rxjs';
import * as actions from '../../../payment-queue/state/actions';
import * as fromShared from '../../../shared/state';
import * as importActions from '../../../shared/state/upload-bulk-document/actions';
import * as selectors from '../../state/selectors';
import { PaymentDetailsStepComponent } from './steps/payment-details-step/payment-details-step.component';
import { ReviewPaymentsDetailsStepComponent } from './steps/review-payments-details-step/review-payments-details-step.component';
import { UploadTemplateAndAttachmentsStepComponent } from './steps/upload-template-and-attachments-step/upload-template-and-attachments-step.component';
import { OrgIdNameAlt } from '@app/models/orgIdNameAlt';
import { TypedAction } from '@ngrx/store/src/models';

const { sharedSelectors, sharedActions } = fromShared;

const defaultError: string = 'Something went wrong, verify file contents and try again';

@Component({
  selector: 'app-manual-payment-request',
  templateUrl: './manual-payment-request.component.html',
  styleUrl: './manual-payment-request.component.scss',
})
export class ManualPaymentRequestComponent implements OnInit {
  @Output() cancel = new EventEmitter<void>();

  public readonly currentProject$ = this.store.select(selectors.item);
  public readonly currentOrg$ = this.store.select(fromOrgs.item);
  public projectName: string;
  public entityId: number;
  public qsfName: string;
  public entityTypeId: number = EntityTypeEnum.Projects;
  public documentImport: DocumentImport;
  public initialDocumentImport: DocumentImport;
  public previewDocId: number;
  public orgId: number;
  private channel: Channel;
  private reviewChannelName: string;
  // eslint-disable-next-line no-restricted-globals
  readonly pusherEvents = Object.keys(DocumentImportLoading).filter((key: string) => !isNaN(Number(DocumentImportLoading[key.toString()])));
  public onPusherMessageReceived: (channelName: string) => void;
  public documentImport$ = this.store.select(sharedSelectors.uploadBulkDocumentSelectors.documentImport);
  public previewTotalPayment$ = this.store.select(sharedSelectors.uploadBulkDocumentSelectors.previewTotalPayment);
  private ngUnsubscribe$: Subject<void> = new Subject<void>();
  public reviewTabsGroup: FileImportTab[];
  public resultTabsGroup: FileImportTab[];
  public previewTotalPayment: number;
  public noteText: string = '';
  public showError: boolean = false;

  readonly stages = ManualPaymentRequestStage;
  public stage: ManualPaymentRequestStage;

  public readonly types = FileImportDocumentType;

  @ViewChild(UploadTemplateAndAttachmentsStepComponent)
  readonly uploadTemplateAndAttachmentsStep: UploadTemplateAndAttachmentsStepComponent;

  @ViewChild(PaymentDetailsStepComponent)
  readonly paymentDetailsStep: PaymentDetailsStepComponent;

  @ViewChild(ReviewPaymentsDetailsStepComponent)
  readonly reviewPaymentsDetailsStepComponent: ReviewPaymentsDetailsStepComponent;

  get isUploadTemplateAndAttachmentsStage(): boolean {
    return this.stage === ManualPaymentRequestStage.UploadTemplateAndAttachments;
  }

  get isPaymentDetailsStage(): boolean {
    return this.stage === ManualPaymentRequestStage.PaymentDetails;
  }

  get isReviewStage(): boolean {
    return this.stage === ManualPaymentRequestStage.ReviewPayments;
  }

  get isResultStage(): boolean {
    return this.stage === ManualPaymentRequestStage.Result;
  }

  get isUploadTemplateAndAttachmentsNextBtnEnabled(): boolean {
    return this.isUploadTemplateAndAttachmentsStage && this.uploadTemplateAndAttachmentsStep?.paymentDetailsFile != null;
  }

  get isPaymentDetailsNextBtnEnabled(): boolean {
    return this.isPaymentDetailsStage && this.paymentDetailsStep?.isValid();
  }

  get isPaymentsReviewNextBtnEnabled(): boolean {
    return this.isReviewStage
      && !this.showError
      && this.reviewPaymentsDetailsStepComponent?.showNotes()
      && this.reviewPaymentsDetailsStepComponent?.isValid();
  }


  readonly awaitedActionTypesForUploadTemplate = [
    actions.Error.type,
    commonActions.FormInvalid.type,
    actions.ProcessBatchActionCompleted,
    actions.ProcessBatchActionError,
  ];

  public ngOnInit(): void {
    this.stage = ManualPaymentRequestStage.UploadTemplateAndAttachments;
    this.currentProject$.pipe(
      filter((x: Project) => !!x),
    ).subscribe((project: Project) => {
      this.projectName = project.name;
      this.entityId = project.id;
      this.orgId = project.qsfOrgId;
      this.store.dispatch(actions.GetOrg({ id: project.qsfOrgId }));
      this.actionsSubj.pipe(
        ofType(
          actions.GetOrgComplete,
        ),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe((res: any) => {
        this.qsfName = OrgIdNameAlt.getQsfOrgName(res.data.name, res.data.altName);
      });
      this.initDocumentImport();
    });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(
        importActions.SubmitBulkDocumentSuccess,
        importActions.UploadAdditionalDocumentsSuccess,
        importActions.ReviewJobSuccess,
        importActions.ApproveJobSuccess
      ),
    ).subscribe((action: TypedAction<string>) => {
      if (this.stage == ManualPaymentRequestStage.UploadTemplateAndAttachments
        || this.stage == ManualPaymentRequestStage.ReviewPayments
        || (this.stage == ManualPaymentRequestStage.PaymentDetails
              && action.type == importActions.ReviewJobSuccess.type)
      ) {
        // continue showing loading indicator until pusher response
        if (!this.showError) {
          setTimeout(() => {
            if (!this.showError) {
              this.service.show();
            }
          }, 300);
        } else {
          this.service.hide();
        }
      }

      //if additional documents exist, firstly load them (onSubmitDetails)
      // and if success -> dispatch ReviewJobRequest
      if (this.stage == ManualPaymentRequestStage.PaymentDetails) {
        if (action.type == importActions.UploadAdditionalDocumentsSuccess.type) {
          this.store.dispatch(sharedActions.uploadBulkDocumentActions.ReviewJobRequest({
            id: this.documentImport.id,
            channelName: this.reviewChannelName,
          }));
        }
      }
    });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(
        sharedActions.uploadBulkDocumentActions.UpdateDocumentImportSuccess
      ),
    ).subscribe(result => {
      this.documentImport = result.documentImport;
      this.generatePreviewTabs();
    });
    this.generatePreviewTabs();

    this.resultTabsGroup = [
      {
        tab: FileImportReviewTabs.AllRecords,
        title: 'All Records',
        count: this.documentImport.countTotal,
      }
    ];
  }

  private generatePreviewTabs(): void {
    this.reviewTabsGroup = [
      {
        tab: FileImportReviewTabs.AllRecords,
        title: 'All Records',
        count: this.documentImport.countTotal,
      },
      {
        tab: FileImportReviewTabs.Errors,
        title: 'Errors',
        count: this.documentImport.countErrored,
      },
      {
        tab: FileImportReviewTabs.Warnings,
        title: 'Warnings',
        count: this.documentImport.countWarned,
      },
      {
        tab: FileImportReviewTabs.Queued,
        title: 'Queued',
        count: this.documentImport.countLoaded,
      },
    ];
  }

  private initDocumentImport(): void {
    if (!this.documentImport?.id) {
      const documentImport: DocumentImport = {
        entityId: this.entityId,
        entityTypeId: this.entityTypeId,
      } as DocumentImport;
      this.store.dispatch(sharedActions.uploadBulkDocumentActions.SetDocumentImport({ documentImport }));
    }
    this.documentImport$.pipe(
      filter((x: DocumentImport) => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((result: DocumentImport) => {
      this.documentImport = result;
      if (this.documentImport.previewDoc && !this.documentImport.loadingResultsDoc) {
        this.stage = ManualPaymentRequestStage.PaymentDetails;
      }
      if (this.documentImport.loadingResultsDoc) {
        this.stage = ManualPaymentRequestStage.Result;
      }
    })

    this.previewTotalPayment$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((previewTotalPayment: number) => {
      this.previewTotalPayment = previewTotalPayment;
    });
    this.initialDocumentImport = CommonHelper.getDeepCopy<DocumentImport>(this.documentImport);
  }

  constructor(
    protected readonly store: Store<fromShared.AppState>,
    private pusher: PusherService,
    public service: LoadingIndicatorService,
    private readonly actionsSubj: ActionsSubject,
  ) {
  }

  onSubmit(): void {
    switch (this.stage) {
      case ManualPaymentRequestStage.UploadTemplateAndAttachments:
        this.onImport();
        break;
      case ManualPaymentRequestStage.PaymentDetails:
        this.onSubmitDetails();
        break;
      case ManualPaymentRequestStage.ReviewPayments:
        this.onSubmitReview();
        break;
    }
  }

  onBack(): void {
    switch (this.stage) {
      case ManualPaymentRequestStage.PaymentDetails:
        this.stage = ManualPaymentRequestStage.UploadTemplateAndAttachments;
        this.onImport();
        break;
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  public onImport(): void {
    this.showError = false;
    this.documentImport = CommonHelper.getDeepCopy<DocumentImport>(this.initialDocumentImport);
    const job: Job = {
      entityId: this.entityId,
      entityTypeId: this.entityTypeId,
      description: 'Manual Payment Request Import Job',
      scheduleType: null,
      id: 0,
      statusId: 0,
      statusMessage: null,
    };
    const documentImport: DocumentImport = {
      ...this.documentImport,
      templateId: DocumentImportTemplate.ManualPaymentRequest,
      job,
      channelName: this.getChannelName(),
      config: { caseId: this.entityId, qsfProjectId: this.orgId },
    };
    this.subscribeToImportPusher(
      documentImport.channelName,
      () => this.store.dispatch(importActions.SubmitBulkDocumentRequest({ file: this.uploadTemplateAndAttachmentsStep.paymentDetailsFile, documentImport })),
    );
  }

  public onSubmitDetails(): void {
    this.reviewChannelName = this.getChannelName();
    this.channel = this.pusher.subscribeChannel(
      this.reviewChannelName,
      this.pusherEvents,
      this.reviewingPusherCallback.bind(this),
    );

    //if additional documents exist, firstly load them
    // and if success -> dispatch ReviewJobRequest (in ngOnInit)
    if (this.uploadTemplateAndAttachmentsStep.additionalDocumentsFiles.length > 0) {
      this.store.dispatch(sharedActions.uploadBulkDocumentActions.UploadAdditionalDocuments({
        documentImportId: this.documentImport.id,
        files: this.uploadTemplateAndAttachmentsStep.additionalDocumentsFiles
      }))
    } else {
      this.store.dispatch(sharedActions.uploadBulkDocumentActions.ReviewJobRequest({
        id: this.documentImport.id,
        channelName: this.reviewChannelName,
      }));
    }
  }

  public onSubmitReview(): void {
    this.noteText = this.reviewPaymentsDetailsStepComponent.form.value.note;
    this.subscribeToProcessingPusher((channelName: string) => this.store.dispatch(sharedActions.uploadBulkDocumentActions.ApproveJobRequest({
      id: this.documentImport.id,
      channelName,
    })));
  }

  private subscribeToProcessingPusher(onSubscribedCallback: (channelName: string) => void = null): void {
    if (!this.documentImport.channelName) {
      this.documentImport.channelName = this.getChannelName();
    }

    this.channel = this.pusher.subscribeChannel(
      this.documentImport.channelName,
      this.pusherEvents,
      this.processingPusherCallback.bind(this),
    );

    if (this.onPusherMessageReceived) {
      this.onPusherMessageReceived(this.documentImport.channelName);
    }

    if (onSubscribedCallback) {
      onSubscribedCallback(this.documentImport.channelName);
    }
  }

  private processingPusherCallback(data: GridPusherMessage, event): void {
    if (event === DocumentImportLoading[DocumentImportLoading.Complete]) {
      this.store.dispatch(sharedActions.uploadBulkDocumentActions.GetDocumentImportByIdRequest({ id: this.documentImport.id }));
      this.resetChannel();
    }
    if (event === DocumentImportLoading[DocumentImportLoading.Error]) {
      this.showError = true;
      this.displayError(data.ErrorMessage);
      this.resetChannel();
      this.service.hide();
    }
  }

  private subscribeToImportPusher(channelName: string, callback: () => void = null): void {
    this.channel = this.pusher.subscribeChannel(
      channelName,
      this.pusherEvents,
      this.validatingPusherCallback.bind(this),
    );

    if (this.onPusherMessageReceived) {
      this.onPusherMessageReceived(channelName);
    }

    if (callback) {
      callback();
    }
  }

  private validatingPusherCallback(data: GridPusherMessage, event): void {
    switch (event) {
      case DocumentImportLoading[DocumentImportLoading.Error]:
         // Set the flag to true if wrong file type is imported or if wrong xlsx is imported
        if (data.ErrorMessage.includes("Invalid file signature.") || data.ErrorMessage.includes("File tabs do not match.") ) {
          this.showError = true;
        } else {
          this.displayError(data.ErrorMessage);
        }
        this.resetChannel();
        this.service.hide();
        break;
      case DocumentImportLoading[DocumentImportLoading.Pending]:
        this.showError = false;
        this.store.dispatch(sharedActions.uploadBulkDocumentActions.GetDocumentImportByIdRequest({ id: this.documentImport.id }));
        this.resetChannel();
        break;
    }
  }

  private reviewingPusherCallback(data: GridPusherMessage, event): void {
    switch (event) {
      case DocumentImportLoading[DocumentImportLoading.Error]:
        this.showError = true;
        this.displayError(`Payment request configuration failed: ${data.ErrorMessage}`);
        this.resetChannel();
        this.service.hide();
        break;
      case DocumentImportLoading[DocumentImportLoading.Pending]:
        this.stage = ManualPaymentRequestStage.ReviewPayments;
        this.store.dispatch(sharedActions.uploadBulkDocumentActions.UpdateDocumentImport({ id: this.documentImport.id }));
        this.store.dispatch(sharedActions.uploadBulkDocumentActions.DocumentImportGetTotalPayment({ id: this.documentImport.id }));
        this.resetChannel();
        break;
    }
  }

  public downloadFile(): void {
    if (!this.documentImport?.previewImportDoc?.id) {
      return;
    }
    let docId = this.documentImport?.previewImportDoc?.id;
    this.store.dispatch(batchActions.DownloadDocument({ id: docId }));
  }

  private displayError(message?: string): void {
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.Error({ error: message || defaultError }));
  }

  private resetChannel(): void {
      this.pusher.unsubscribeChannel(this.channel);
      this.channel = null;
  }

  private getChannelName(): string {
    return StringHelper.generateChannelName(
      JobNameEnum.UploadBulkDocument,
      this.entityId,
      this.entityTypeId,
    );
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
