import { Component, OnInit, OnDestroy } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil, filter, first } from 'rxjs/operators';

import { DocumentImport, DocumentImportTemplate, Job } from '@app/models/documents';
import { PusherService } from '@app/services/pusher.service';
import {
  DocumentImportLoading, EntityTypeEnum, FileImportDocumentType,
  FileImportETLStatusEnum,
  FileImportReviewTabs, FileImportTemplateTypes,
  JobNameEnum,
  TempaltesWithoutConfigStage,
  UploadBulkDocumentStage,
}
  from '@app/models/enums';

import { Channel } from 'pusher-js';
import { FileImportTab, ValidationResults } from '@app/models/file-imports';
import { FileImportTemplateFields, LedgerTemplate } from '@app/models/file-imports/templates';
import { UploadBulkDocumentStageWithoutConfigure } from '@app/models/enums/upload-bulk-document-stage-without-config.enum';
import { GridPusherMessage } from '@app/models/documents/grid-pusher-message';
import { DisbursementGroupTemplate } from '@app/models/file-imports/templates/disbursement-group-template';
import { StringHelper } from '@app/helpers';
import { ModalService } from '@app/services';
import { IUploadBulkDropdownData } from '@app/models/documents/dropdown-data';
import * as actions from '../state/upload-bulk-document/actions';
import * as fromShared from '../state';
import { FileImportConfirmationDialog } from './file-import-confirmation-dialog/file-import-confirmation-dialog.component';

const { sharedSelectors, sharedActions } = fromShared;

const defaultError: string = 'Something went wrong, verify file contents and try again';
@Component({
  selector: 'app-upload-bulk-document-modal',
  templateUrl: './upload-bulk-document-modal.component.html',
  styleUrls: ['./upload-bulk-document-modal.component.scss'],
  providers: [ModalService],
})
export class UploadBulkDocumentModalComponent implements OnInit, OnDestroy {
  public errorMessage$ = this.store.select(sharedSelectors.uploadBulkDocumentSelectors.error);
  public entityId: number;
  public entityTypeId: number;
  public importTypeId: number;
  public projectsEntityType = EntityTypeEnum.Projects;
  public disbursementGroupEntityType = EntityTypeEnum.DisbursementGroups;
  public allowedExtensions: string[];
  public initialStage: UploadBulkDocumentStage | UploadBulkDocumentStageWithoutConfigure;
  public stage: UploadBulkDocumentStage | UploadBulkDocumentStageWithoutConfigure;
  public documentImportTemplates: DocumentImportTemplate[] = [];
  public documentImport$ = this.store.select(sharedSelectors.uploadBulkDocumentSelectors.documentImport);
  public documentImportSelectedTemplate$ = this.store.select(sharedSelectors.uploadBulkDocumentSelectors.selectedTemplate);
  public isValidSelect$ = this.store.select(sharedSelectors.uploadBulkDocumentSelectors.isValidSelect);
  public isValidGroupSelect$ = this.store.select(sharedSelectors.uploadBulkDocumentSelectors.isValidGroupSelect);
  public isValidConfigure$ = this.store.select(sharedSelectors.uploadBulkDocumentSelectors.isValidConfigure);
  public isValidUpload$ = this.store.select(sharedSelectors.uploadBulkDocumentSelectors.isValidUpload);
  public previewFile$ = this.store.select(sharedSelectors.uploadBulkDocumentSelectors.previewFileRows);
  public isValidationInProgress$ = this.store.select(sharedSelectors.uploadBulkDocumentSelectors.isValidationInProgress);
  public isProcessingInProgress$ = this.store.select(sharedSelectors.uploadBulkDocumentSelectors.isProcessingInProgress);
  public isApproved$ = this.store.select(sharedSelectors.uploadBulkDocumentSelectors.isApproved);
  public dropdownValues$ = this.store.select(sharedSelectors.uploadBulkDocumentSelectors.data);
  public previewFile: ValidationResults;

  public documentImport: DocumentImport;
  public documentImportTemplate: DocumentImportTemplate;
  private ngUnsubscribe$: Subject<void> = new Subject<void>();
  private validSelect: boolean;
  public isValidGroupSelect: boolean;
  private validConfigure: boolean;
  private validUpload: boolean;
  public isValidationInProgress: boolean;
  public isProcessingInProgress: boolean;
  public provideTemplate: boolean;

  private channel: Channel;

  public tabsPreviewGroup: FileImportTab[];
  public tabsResultGroup: FileImportTab[];

  public loadingResultAvailable: boolean = false;

  public readonly types = FileImportDocumentType;
  // eslint-disable-next-line no-restricted-globals
  readonly pusherEvents = Object.keys(DocumentImportLoading).filter((key: string) => !isNaN(Number(DocumentImportLoading[key.toString()])));

  public onPusherMessageReceived: (channelName: string) => void;

  public get validationResultsAvailable(): boolean {
    if (this.documentImport && this.documentImport.previewImportDoc && this.documentImport.previewImportDoc.id > 0) {
      return true;
    }

    return false;
  }

  public get shouldSkipConfigStage(): boolean {
    return Object.values(TempaltesWithoutConfigStage).includes(this.documentImport?.templateId);
  }

  public get stages(): typeof UploadBulkDocumentStage | typeof UploadBulkDocumentStageWithoutConfigure {
    return !this.shouldSkipConfigStage || this.importTypeId === this.disbursementGroupEntityType
      ? UploadBulkDocumentStage
      : UploadBulkDocumentStageWithoutConfigure;
  }

  readonly awaitedValidateActionTypes = [
    sharedActions.uploadBulkDocumentActions.ModalError.type,
    sharedActions.uploadBulkDocumentActions.Error.type,
    sharedActions.uploadBulkDocumentActions.GetDocumentImportByIdSuccess.type,
  ];

  readonly awaitedDocumentDownloadActionTypes = [
    sharedActions.uploadBulkDocumentActions.ModalError.type,
    sharedActions.uploadBulkDocumentActions.DownloadDocumentError.type,
    sharedActions.uploadBulkDocumentActions.DownloadDocumentComplete.type,
  ];

  readonly awaitedApproveActionTypes = [
    sharedActions.uploadBulkDocumentActions.ConfirmApproveDocumentCancelled.type,
    sharedActions.uploadBulkDocumentActions.ModalError.type,
    sharedActions.uploadBulkDocumentActions.Error.type,
    sharedActions.uploadBulkDocumentActions.ApproveJobSuccess.type,
  ];

  constructor(
    private modal: BsModalRef,
    private pusher: PusherService,
    private store: Store<fromShared.AppState>,
    private modalService: ModalService,
  ) { }

  public ngOnInit(): void {
    this.setModalStage(this.initialStage);
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.LoadDefaultData({ entityType: (this.importTypeId || this.entityTypeId), entityId: this.entityId }));
    this.initDocumentImport();
    this.dropdownValues$.pipe(
      first((x: IUploadBulkDropdownData) => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((result: IUploadBulkDropdownData) => {
      this.documentImportTemplates = result.templates;
      this.initReopeningModal();
      this.initValues();
    });

    this.store.select(sharedSelectors.uploadBulkDocumentSelectors.stage).pipe(
      filter((x: UploadBulkDocumentStage | UploadBulkDocumentStageWithoutConfigure) => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((result: UploadBulkDocumentStage | UploadBulkDocumentStageWithoutConfigure) => { this.stage = result; });
  }

  private subscribeToValidationPusher(channelName: string, onSubscribedCallback: () => void = null, callback: () => void = null): void {
    this.channel = this.pusher.subscribeChannel(
      channelName,
      this.pusherEvents,
      this.validatingPusherCallback.bind(this),
      onSubscribedCallback,
    );

    if (this.onPusherMessageReceived) {
      this.onPusherMessageReceived(channelName);
    }

    if (callback) {
      callback();
    }
  }

  private initReopeningModal(): void {
    if (this.documentImport?.id) {
      this.store.dispatch(sharedActions.uploadBulkDocumentActions.GetDocumentImportByIdRequest({ id: this.documentImport.id }));
    }
    if (this.initialStage === this.stages.Upload) {
      if (this.documentImport.job.statusId !== FileImportETLStatusEnum.Error) {
        this.activateValidatingProcess();
      }
    }
  }

  private validatingPusherCallback(data: GridPusherMessage, event): void {
    if (event === DocumentImportLoading[DocumentImportLoading.Validating]) {
      this.store.dispatch(sharedActions.uploadBulkDocumentActions.SetProgressValues({
        progressValues:
        {
          progressWidth: `${data.CurrentPercentage}%`,
          progressValue: <any>data.CurrentPercentage,
          progressTotalCount: data.Total,
          progressCurrentCount: data.CurrentValidatedCount,
        },
      }));
    }

    switch (event) {
      case DocumentImportLoading[DocumentImportLoading.Error]:
        this.displayError(data.ErrorMessage);
        this.resetChannel();
        break;
      case DocumentImportLoading[DocumentImportLoading.Pending]:
        this.store.dispatch(sharedActions.uploadBulkDocumentActions.GetDocumentImportByIdRequest({ id: this.documentImport.id }));
        this.resetChannel();
        break;
        // no default
    }
  }

  private resetChannel(): void {
    this.pusher.unsubscribeChannel(this.channel);
    this.channel = null;
  }

  private displayError(message?: string): void {
    this.setModalStage(this.stages.Upload);
    this.store.dispatch(actions.ResetOnErrorUploadBulkDocumentState());
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.Error({ error: message || defaultError }));
  }

  private processingPusherCallback(data: GridPusherMessage, event): void {
    if (event === DocumentImportLoading[DocumentImportLoading.Loading]) {
      this.store.dispatch(sharedActions.uploadBulkDocumentActions.SetProgressValues({
        progressValues:
        {
          progressWidth: `${data.CurrentPercentage}%`,
          progressValue: <any>data.CurrentPercentage,
          progressTotalCount: data.Enqueued,
          progressCurrentCount: data.CurrentLoadedCount,
          progressLoadedRows: [
            { Inserts: data.Inserted, Updates: data.Updated, Deletes: data.Deleted, NoUpdates: data.NotUpdated },
          ],
        },
      }));
    }

    if (event === DocumentImportLoading[DocumentImportLoading.Complete]) {
      this.store.dispatch(sharedActions.uploadBulkDocumentActions.GetDocumentImportByIdRequest({ id: this.documentImport.id }));
      this.pusher.unsubscribeChannel(this.channel);
    }
    if (event === DocumentImportLoading[DocumentImportLoading.Error]) {
      this.displayError(data.ErrorMessage);
      this.pusher.unsubscribeChannel(this.channel);
      this.resetProgressBar();
      this.previewFile = null;
    }
  }

  ngOnDestroy(): void {
    this.store.dispatch(actions.ResetUploadBulkDocumentState());
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  private initValues(): void {
    this.documentImport$.pipe(
      filter((x: DocumentImport) => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((result: DocumentImport) => {
      this.documentImport = result;
      if (!this.documentImport.id) {
        return;
      }

      if (this.documentImport.job.statusId === FileImportETLStatusEnum.Error) {
        this.activateErrorState();
        return;
      }
      this.generateResultTabsGroup(this.documentImport.templateId);
      if (this.documentImport.previewDoc && !this.previewFile) {
        this.store.dispatch(sharedActions.uploadBulkDocumentActions.GetDocumentImportPreviewRequest({ id: this.documentImport.previewDoc.id }));
      }

      if (this.documentImport.loadingResultsDoc) {
        this.loadingResultAvailable = true;
        this.approveDocument();
        this.store.dispatch(sharedActions.uploadBulkDocumentActions.IsProcessingInProgress({ isProcessingInProgress: false }));
      }
      if ((this.initialStage === this.stages.Result) && !this.documentImport.loadingResultsDoc) {
        this.approveDocument();
        this.activateProcessing();
      }
    });

    this.documentImportSelectedTemplate$.pipe(
      filter((x: DocumentImportTemplate) => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((result: DocumentImportTemplate) => {
      this.documentImportTemplate = result;
      this.provideTemplate = result.provideTemplate;
    });

    this.isValidSelect$.pipe(
      filter((x: boolean) => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((result: boolean) => { this.validSelect = result; });

    this.isValidGroupSelect$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((result: boolean) => { this.isValidGroupSelect = result; });

    this.isValidConfigure$.pipe(
      filter((x: boolean) => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((result: boolean) => { this.validConfigure = result; });

    this.isValidUpload$.pipe(
      filter((x: boolean) => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((result: boolean) => { this.validUpload = result; });

    this.previewFile$.pipe(
      filter((x: ValidationResults) => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((result: ValidationResults) => {
      this.previewFile = result;
      this.store.dispatch(sharedActions.uploadBulkDocumentActions.IsValidationInProgress({ isValidationInProgress: false }));
      if (this.initialStage === this.stages.Select || this.initialStage === this.stages.Upload) {
        this.moveToNextStep();
      }
      this.generatePreviewTabsGroup();
    });

    this.isValidationInProgress$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((result: boolean) => { this.isValidationInProgress = result; });

    this.isProcessingInProgress$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((result: boolean) => { this.isProcessingInProgress = result; });

    this.dropdownValues$.pipe(
      filter((x: IUploadBulkDropdownData) => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((result: IUploadBulkDropdownData) => {
      this.documentImportTemplates = result.templates;
      this.initDocumentImport();
    });
  }

  private isDisbursementWorksheetTemplate(templateId: number): boolean {
    const templateIdChecked = +templateId;
    return templateIdChecked === FileImportTemplateTypes.CondensedDisbursementWorksheet
      || templateIdChecked === FileImportTemplateTypes.DetailedDisbursementWorksheet
      || templateIdChecked === FileImportTemplateTypes.GTFMDW;
  }

  public showDisbursementGroup(): boolean {
    return this.importTypeId === EntityTypeEnum.DisbursementGroups || (this.documentImport && this.isDisbursementWorksheetTemplate(this.documentImport.templateId));
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

  private isValidForm(): boolean {
    return this.validSelect && this.validUpload;
  }

  private initDocumentImport(): void {
    if (!this.documentImport?.id) {
      const documentImport: DocumentImport = {
        entityId: this.entityId,
        entityTypeId: this.entityTypeId,
      } as DocumentImport;

      this.store.dispatch(sharedActions.uploadBulkDocumentActions.SetDocumentImport({ documentImport }));
    }
  }

  public moveToNextStep(): void {
    this.setModalStage(this.changeStage(1));
  }

  public onBack(): void {
    this.setModalStage(this.changeStage(-1));
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.Error({ error: null }));
  }

  public onNextSelect(): void {
    if (!this.validSelect) {
      return;
    }

    this.moveToNextStep();
  }

  public onValidate(): void {
    const job: Job = {
      entityId: this.entityId,
      entityTypeId: this.entityTypeId,
      description: 'Document Import Job',
      scheduleType: null,
      id: 0,
      statusId: 0,
      statusMessage: null,
    };
    const documentImport: DocumentImport = {
      ...this.documentImport,
      job,
      channelName: this.getChannelName(),
    };
    if (this.isValidForm()) {
      this.subscribeToValidationPusher(
        documentImport.channelName,
        () => {
          this.resetProgressBar();
          this.activateValidatingProcess();
        },
        () => this.store.dispatch(actions.SubmitBulkDocumentRequest({ file: this.documentImport.fileContent, documentImport })),
      );
    }
  }

  public downloadTemplate(): void {
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.DownloadRelatedTemplate({ id: this.documentImportTemplate.id, projectId: this.entityId }));
  }

  public onApprove(): void {
    if (!this.previewFile.enqueuedCount) {
      return;
    }

    if (this.documentImport?.countErrored) {
      const initialState = {
        title: `File Import - ${this.documentImport?.templateName}`,
        message: `This import includes ${this.documentImport?.countErrored} error(s).`,
        buttonOkText: 'Continue',
      };

      const bfModalRef = this.modalService.show(FileImportConfirmationDialog, { initialState });

      this.modalService.onHidden.pipe(
        takeUntil(this.ngUnsubscribe$),
      ).subscribe(() => {
        const confirmed = bfModalRef.content.confirmed;
        if (!confirmed) {
          this.store.dispatch(sharedActions.uploadBulkDocumentActions.ConfirmApproveDocumentCancelled());
          return;
        }
        this.approve();
      });
    } else {
      this.approve();
    }
  }

  private approve(): void {
    this.subscribeToProcessingPusher((channelName: string) => this.store.dispatch(sharedActions.uploadBulkDocumentActions.ApproveJobRequest({
      id: this.documentImport.id,
      channelName,
    })));

    this.activateProcessing();
    this.resetProgressBar();
    this.moveToNextStep();
  }

  public onValidationResultsClick(): void {
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.DownloadDocument({ id: this.documentImport.previewImportDoc.id }));
  }

  public onOriginalFileClick(): void {
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.DownloadDocument({ id: this.documentImport.importDoc.id }));
  }

  public onLogFileClick(): void {
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.DownloadLog({ id: this.documentImport.id }));
  }

  public canApprove(): boolean {
    return !!this.previewFile?.enqueuedCount && this.documentImport.job.statusId === FileImportETLStatusEnum.Pending;
  }

  public isDisabledConfigureStage(): boolean {
    return (this.documentImport?.templateId !== FileImportTemplateTypes.Intake
      && this.documentImport?.templateId !== FileImportTemplateTypes.ClientOrganizationEntityAccess
      && this.documentImport?.templateId !== FileImportTemplateTypes.ClientExternalIdentifiers)
      && !this.isValidGroupSelect
      && !!this.stages.Configure;
  }

  private activateErrorState(): void {
    this.dropdownValues$.pipe(
      filter((x: IUploadBulkDropdownData) => !!x),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((result: IUploadBulkDropdownData) => {
      const selectedTemplate = result.templates.find((x: DocumentImportTemplate) => x.id === this.documentImport.templateId);
      this.store.dispatch(sharedActions.uploadBulkDocumentActions.SetDocumentImportTemplate({ selectedTemplate }));
    });
    this.displayError();
  }

  private changeStage(value: number): UploadBulkDocumentStage {
    return this.stage + value;
  }

  public onClose(): void {
    this.modal.hide();
  }

  private setModalStage(stage: UploadBulkDocumentStage | UploadBulkDocumentStageWithoutConfigure): void {
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.SetModalStage({ stage }));
  }

  private resetProgressBar(): void {
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.ResetProgressValues());
  }

  private approveDocument(): void {
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.ApproveDocument());
  }

  private activateProcessing(): void {
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.IsProcessingInProgress({ isProcessingInProgress: true }));
  }

  private activateValidatingProcess(): void {
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.IsValidationInProgress({ isValidationInProgress: true }));
  }

  private generateResultTabsGroup(templateId: number): void {
    switch (templateId) {
      case FileImportTemplateTypes.DisbursementGroups:
        this.tabsResultGroup = DisbursementGroupTemplate.generateResultTabsGroup(this.documentImport);
        break;
      case FileImportTemplateTypes.CondensedDisbursementWorksheet:
      case FileImportTemplateTypes.DetailedDisbursementWorksheet:
      case FileImportTemplateTypes.NewDetailedDisbursementWorksheet:
      case FileImportTemplateTypes.LedgerLienDataFees:
      case FileImportTemplateTypes.LedgerArcherFees:
      case FileImportTemplateTypes.GrossAllocation:
      case FileImportTemplateTypes.GTFMDW:
      case FileImportTemplateTypes.NewGTFMDW:
      case FileImportTemplateTypes.FirmFeeAndExpense:
      case FileImportTemplateTypes.SimpleGeneralLedger:
        this.tabsResultGroup = LedgerTemplate.generateResultTabsGroup(this.documentImport);
        break;
      default:
        this.tabsResultGroup = FileImportTemplateFields.generateResultTabsGroup(this.documentImport);
        break;
    }
  }

  private generatePreviewTabsGroup(): void {
    this.tabsPreviewGroup = [
      {
        tab: FileImportReviewTabs.AllRecords,
        title: 'All Records',
        count: this.previewFile.totalCount,
      },
      {
        tab: FileImportReviewTabs.Errors,
        title: 'Errors',
        count: this.previewFile.errorCount,
      },
      {
        tab: FileImportReviewTabs.Warnings,
        title: 'Warnings',
        count: this.previewFile.warningCount,
      },
      {
        tab: FileImportReviewTabs.Queued,
        title: 'Queued',
        count: this.previewFile.enqueuedCount,
      },
    ];
  }

  private getChannelName(): string {
    return StringHelper.generateChannelName(
      JobNameEnum.UploadBulkDocument,
      this.entityId,
      this.entityTypeId,
    );
  }
}
