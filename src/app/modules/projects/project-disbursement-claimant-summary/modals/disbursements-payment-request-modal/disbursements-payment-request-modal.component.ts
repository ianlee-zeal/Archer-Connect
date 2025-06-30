import { Document } from '@app/models/documents/document';
import { Component, OnInit, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { sharedSelectors, sharedActions } from 'src/app/modules/shared/state/index';
import * as fromRoot from '@app/state';
import { Store } from '@ngrx/store';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Attachment } from '@app/models/attachment';
import { DisbursementsPaymentRequestModalStage, EntityTypeEnum, DocumentType as DocumentTypeEnum } from '@app/models/enums';
import { DocumentImport } from '@app/models/documents';
import { MessageService, ToastService } from '@app/services';
import { FileHelper } from '@app/helpers/file.helper';
import * as projectActions from '../../../state/actions';
import * as projectSelectors from '../../../state/selectors';
import { DisbursementPaymentRequestConfigStepComponent } from './steps/disbursement-payment-request-config-step/disbursement-payment-request-config-step';
import { DisbursementPaymentRequestReviewStepComponent } from './steps/disbursement-payment-request-review-step/disbursement-payment-request-review-step.component';

@Component({
  selector: 'app-disbursements-payment-request-modal',
  templateUrl: './disbursements-payment-request-modal.component.html',
  styleUrls: ['./disbursements-payment-request-modal.component.scss'],
})
export class DisbursementsPaymentRequestModalComponent implements OnInit {
  @ViewChild(DisbursementPaymentRequestConfigStepComponent) disbursementPaymentRequestConfigStep: DisbursementPaymentRequestConfigStepComponent;
  @ViewChild(DisbursementPaymentRequestReviewStepComponent) disbursementPaymentRequestReviewStep: DisbursementPaymentRequestReviewStepComponent;
  public entityTypeId: number = EntityTypeEnum.PaymentRequest;
  public projectId: number;
  public projectName: string;
  public selectedFile: File;
  public selectedSpreadSheetFile: File;
  public spreadSheetAttachments: Attachment[] = [];
  public attachments: Document[] = [];
  public allowedExtensions: string[] = [];
  public documentImport: DocumentImport;
  public jobId: number;
  public previewDocId: number;
  public errors: boolean;

  public stage = DisbursementsPaymentRequestModalStage.UploadPayment;

  public allowedExtensions$ = this.store.select(sharedSelectors.commonSelectors.allowedFileExtensions);
  public documentImport$ = this.store.select(sharedSelectors.uploadBulkDocumentSelectors.documentImport);
  public projectDetails$ = this.store.select(projectSelectors.projectDetails);
  public paymentRequestDocumentImport$ = this.store.select(projectSelectors.paymentRequestDocumentImport);
  public paymentRequestDocumentImportPreviewResults$ = this.store.select(projectSelectors.paymentRequestDocumentImportPreviewResults);

  private ngUnsubscribe$ = new Subject<void>();

  get isUploadPaymentStage(): boolean {
    return this.stage === DisbursementsPaymentRequestModalStage.UploadPayment;
  }

  get isReviewStage(): boolean {
    return this.stage === DisbursementsPaymentRequestModalStage.Review;
  }

  get isResultStage(): boolean {
    return this.stage === DisbursementsPaymentRequestModalStage.Result;
  }

  get valid(): boolean {
    switch (this.stage) {
      case DisbursementsPaymentRequestModalStage.UploadPayment:
        return !this.disbursementPaymentRequestConfigStep || this.disbursementPaymentRequestConfigStep.isValid;
      case DisbursementsPaymentRequestModalStage.Review:
        return !this.disbursementPaymentRequestReviewStep || this.disbursementPaymentRequestReviewStep.isValid;
      default:
        return true;
    }
  }

  readonly awaitedActionTypesForUploadPaymentStage = [
    projectActions.GetPaymentRequestImportsResultRequestSuccess.type,
    projectActions.Error.type,
  ];

  readonly awaitedActionTypesForReviewPaymentStage = [
    projectActions.SubmitPaymentRequestImportsResultRequestSuccess.type,
    projectActions.ManualPaymentRequestDocsRequestSuccess.type,
    projectActions.Error.type,
  ];
  constructor(
    private store: Store<fromRoot.AppState>,
    private readonly modal: BsModalRef,
    private toaster: ToastService,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.store.dispatch(sharedActions.commonActions.GetMimeTypes());
    this.store.dispatch(projectActions.GetProjectDetailsRequest({ projectId: this.projectId }));

    this.documentImport$.pipe(
      filter(x => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(result => {
      this.documentImport = result;
    });

    this.allowedExtensions$
      .pipe(
        filter(extensions => !!extensions),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(extensions => {
        this.allowedExtensions = extensions;
      });

    this.paymentRequestDocumentImportPreviewResults$
      .pipe(filter(x => !!x))
      .subscribe(data => {
        this.previewDocId = data.previewImportDoc.id;
        this.errors = !!data.countErrored || !!data.countWarned;
      });
  }

  public onSpreadsheetFileSelected(file: File): void {
    this.selectedFile = file;
    this.selectedSpreadSheetFile = file;
    this.spreadSheetAttachments = [FileHelper.convertToAttachment(this.selectedFile)];
    setTimeout(() => {
      this.selectedFile = null;
    });
  }

  public onFileSelected(file: File): void {
    this.selectedFile = file;
    const document = FileHelper.convertToDocument(this.selectedFile, this.projectId, DocumentTypeEnum.PaymentRequestValidation, EntityTypeEnum.Projects);
    this.attachments.push(document);
    setTimeout(() => {
      this.selectedFile = null;
    });
  }

  public onRemoveSelectedFile(attachment: Attachment, type: string = ''): void {
    const arr = type === 'spreadsheet' ? this.spreadSheetAttachments : this.attachments;
    const addDocFileIndex = arr.findIndex(item => item.name === attachment.name);
    if (addDocFileIndex > -1) {
      arr.splice(addDocFileIndex, 1);
    }
  }

  public onClose() {
    if (this.isResultStage) {
      this.modal.hide();
    } else {
      this.messageService
        .showConfirmationDialog('Cancel', 'Are you sure to cancel?')
        .subscribe(answer => { if (answer) { this.modal.hide(); } });
    }
  }

  onValidate(): void {
    switch (this.stage) {
      case DisbursementsPaymentRequestModalStage.UploadPayment:
        this.disbursementPaymentRequestConfigStep.submit();
        break;
      case DisbursementsPaymentRequestModalStage.Review:
        this.disbursementPaymentRequestReviewStep.onSubmit();
        break;
    }
  }

  public downloadFile() {
    this.store.dispatch(projectActions.GetValidationDocument({ previewDocId: this.previewDocId }));
  }

  public onPreviousStep(): void {
    this.stage -= 1;
  }

  public onReviewIsCompleted() {
    this.stage = DisbursementsPaymentRequestModalStage.Result;
  }

  public onSuccess(jobId: number) {
    this.jobId = jobId;
    this.stage = DisbursementsPaymentRequestModalStage.Review;
  }

  public onFailed(error: string): void {
    this.toaster.showError(error);
  }
}
