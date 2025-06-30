import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Channel } from 'pusher-js';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { ProjectsCommonState } from '@app/modules/projects/state/reducer';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { ToastService } from '@app/services';
import { PusherService } from '@app/services/pusher.service';
import { Org, PaymentRequest } from '@app/models';
import { JobStatus, EntityTypeEnum, JobNameEnum, FileImportETLStatusEnum } from '@app/models/enums';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { CommonHelper, StringHelper } from '@app/helpers';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { sharedSelectors, sharedActions } from 'src/app/modules/shared/state/index';
import { Attachment } from '@app/models/attachment';
import { QsfOrgSelectionModalComponent } from '@app/modules/shared/entity-selection-modal/qsf-org-selection-modal.component';
import { OrgType } from '@app/models/enums/org-type.enum';
import { DocumentImport, Job } from '@app/models/documents';
import { PaymentRequestUpload } from '@app/models/payment-request-upload';
import { DocumentImportTemplate } from '@app/models/enums/document-import-template.enum';
import { GridPusherMessage } from '@app/models/documents/grid-pusher-message';
import { ModalService } from '../../../../../../../services/modal.service';
import * as selectors from '../../../../../state/selectors';
import * as actions from '../../../../../state/actions';

@Component({
  selector: 'app-disbursement-payment-request-config-step',
  templateUrl: './disbursement-payment-request-config-step.html',
  styleUrls: ['./disbursement-payment-request-config-step.scss'],
})
export class DisbursementPaymentRequestConfigStepComponent extends ValidationForm implements OnInit, OnDestroy {
  @Input() projectId: number;
  @Input() projectName: string;
  @Input() paymentRequestEntityType: EntityTypeEnum;
  @Input() selectedSpreadSheetFile: File;
  @Input() spreadSheetAttachments: Attachment[] = [];
  @Input() attachments: Attachment[] = [];
  @Input() allowedExtensions: string[] = [];
  @Output() readonly finish = new EventEmitter<number>();
  @Output() readonly fail = new EventEmitter<string>();

  public selectedFile: File;
  public attachmentEdited: boolean;
  public documentImport: DocumentImport;
  public request: PaymentRequest;
  private channel: Channel;
  private jobId: number;

  readonly entityTypeEnum = EntityTypeEnum;
  readonly entityTypeId: number = EntityTypeEnum.PaymentRequest;

  public form: UntypedFormGroup = new UntypedFormGroup({
    qsfOrg: new UntypedFormControl(null),
    qsfOrgId: new UntypedFormControl(null),
    totalRows: new UntypedFormControl(null, Validators.required),
    totalAmount: new UntypedFormControl(null, Validators.required),
  });

  readonly awaitedActionTypesForDownloadTemplate = [
    sharedActions.uploadBulkDocumentActions.DownloadTemplateSuccess.type,
    sharedActions.uploadBulkDocumentActions.Error.type,
  ];

  readonly documentImport$ = this.store.select(sharedSelectors.uploadBulkDocumentSelectors.documentImport);
  readonly projectDetails$ = this.store.select(selectors.projectDetails);
  readonly paymentRequestDocumentImport$ = this.store.select(selectors.paymentRequestDocumentImport);
  readonly allowedExtensions$ = this.store.select(sharedSelectors.commonSelectors.allowedFileExtensions);
  private readonly ngUnsubscribe$ = new Subject<void>();

  get isValid(): boolean {
    return (!this.form || this.form.valid) && !CommonHelper.isNullOrUndefined(this.spreadSheetAttachments) && this.spreadSheetAttachments.length > 0;
  }

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  constructor(
    private readonly store: Store<ProjectsCommonState>,
    private readonly toaster: ToastService,
    private readonly pusher: PusherService,
    private readonly enumToArrayPipe: EnumToArrayPipe,
    private readonly modal: BsModalRef,
    private readonly modalService: ModalService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribeToFileExtensions();
    this.subscribeToProjectDetails();
    this.subscribeToDocumentImport();
    this.subscribeToPaymentRequestDocumentImport();

    this.store.dispatch(sharedActions.commonActions.GetMimeTypes());
    this.store.dispatch(actions.GetProjectDetailsRequest({ projectId: this.projectId }));
  }

  submit() {
    if (!super.validate()) {
      this.toaster.showWarning('Form is not valid', 'Cannot save');
      return;
    }

    const job: Job = {
      entityId: this.projectId,
      entityTypeId: this.entityTypeId,
      description: 'Payment Request Import Job',
      scheduleType: null,
      id: 0,
      statusId: 0,
      statusMessage: null,
    };

    const documentImport: DocumentImport = {
      ...this.documentImport,
      entityId: this.projectId,
      entityTypeId: EntityTypeEnum.Projects,
      fileContent: this.selectedSpreadSheetFile,
      templateId: DocumentImportTemplate.PaymentRequest,
      templateName: 'Payment Request Import',
      job,
      channelName: this.getChannelName(),
    };

    const paymentRequest: PaymentRequestUpload = {
      caseId: this.projectId,
      totalRows: this.form.get('totalRows').value,
      totalAmount: this.form.get('totalAmount').value,
      qsf: this.form.get('qsfOrgId').value,
      spreadsheet: documentImport,
    };

    this.store.dispatch(actions.ValidatePaymentRequest({ paymentRequest }));
  }

  private generatePaymentRequestCallback(data: GridPusherMessage, event: string) {
    switch (event) {
      case FileImportETLStatusEnum[FileImportETLStatusEnum.Pending]:
        this.store.dispatch(actions.GetDocumentImportById({ id: this.jobId }));
        this.finish.emit(this.jobId);
        this.unsubscribeFromChannel();
        break;
      case FileImportETLStatusEnum[FileImportETLStatusEnum.Error]:
        this.fail.emit(data.ErrorMessage);
        this.unsubscribeFromChannel();
        break;
    }
  }

  private unsubscribeFromChannel(): void {
    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
      this.channel = null;
    }
  }

  public onClose() {
    this.modal.hide();
  }

  onDownloadTemplate() {
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.DownloadTemplate({
      id: DocumentImportTemplate.PaymentRequest,
      fileName: 'ManualPaymentRequestSpreadsheetArcherTemplate.xlsx',
    }));
  }

  private subscribeToDocumentImport() {
    this.documentImport$.pipe(
      filter(x => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(result => {
      this.documentImport = result;
    });
  }

  private subscribeToPaymentRequestDocumentImport() {
    this.paymentRequestDocumentImport$.pipe(
      filter(data => data !== null),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(data => {
      this.jobId = data.id;
      this.unsubscribeFromChannel();
      this.channel = this.pusher.subscribeChannel(
        data.channelName,
        this.enumToArrayPipe.transformToKeysArray(JobStatus),
        this.generatePaymentRequestCallback.bind(this),
      );
    });
  }

  private subscribeToFileExtensions(): void {
    this.allowedExtensions$
      .pipe(
        filter(extensions => !!extensions),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(extensions => {
        this.allowedExtensions = extensions;
      });
  }

  private subscribeToProjectDetails(): void {
    this.projectDetails$.pipe(
      filter(x => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(item => {
      if (item.qsfOrg) {
        this.form.get('qsfOrgId').setValue(item.qsfOrg.id);
        this.form.get('qsfOrg').setValue(item.qsfOrg.name);
        this.form.updateValueAndValidity();
      }
    });
  }

  private getChannelName(): string {
    return StringHelper.generateChannelName(
      JobNameEnum.ManualPaymentRequest,
      this.projectId,
      this.entityTypeId,
    );
  }

  public onOpenQSFModal(): void {
    this.modalService.show(QsfOrgSelectionModalComponent, {
      initialState: {
        onEntitySelected: (entity: Org) => this.onOrgSelect(entity, 'qsfOrg', 'qsfOrgId'),
        orgTypeIds: [OrgType.QualifiedSettlementFund],
        title: 'Qualified Settlement Fund Selection',
      },
      class: 'entity-selection-modal',
    });
  }

  private onOrgSelect(org: Org, name: string, id: string) {
    this.form.patchValue({ [name]: org.name, [id]: org.id });
    this.form.updateValueAndValidity();
    this.form.markAsDirty();
  }

  public onClear(controlName: string): void {
    this.form.patchValue({ [controlName]: null, [`${controlName}Id`]: null });
    this.form.updateValueAndValidity();
    this.form.markAsDirty();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
    if (this.channel) {
      this.channel.unsubscribe();
    }
  }
}
