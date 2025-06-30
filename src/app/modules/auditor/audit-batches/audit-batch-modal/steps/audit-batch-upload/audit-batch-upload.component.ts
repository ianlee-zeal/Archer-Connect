import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { filter, takeUntil } from 'rxjs/operators';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromShared from '@shared/state';
import { AuditorState } from '@app/modules/auditor/state/reducer';
import { StringHelper } from '@app/helpers/string.helper';
import { RunAuditorCommand } from '@app/models/auditor/run-auditor-command';
import { AuditRun } from '@app/models/auditor/audit-run';
import { AuditRunCreation } from '@app/models/auditor/audit-run-creation';
import { AuditBatchUploading } from '@app/models/enums/audit-batch-uploading.enum';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { PreviewStatus } from '@app/models/auditor/preview-status.enum';
import { MimeType } from '@app/models/mime-type';

import { Document, DocumentImport, Job } from '@app/models/documents';

import { Channel } from 'pusher-js';
import { PusherService } from '@app/services/pusher.service';

import { GridPusherMessage } from '@app/models/documents/grid-pusher-message';
import { AuditorPusherMessage } from '@app/models/auditor/auditor-pusher-message';

import { DocumentImportLoading, DocumentType, EntityTypeEnum, JobNameEnum } from '@app/models/enums';
import { FileHelper } from '@app/helpers/file.helper';
import { auditBatchModalSelectors, auditBatchModalState } from '../../state/selectors';
import * as auditBatchModalActions from '../../state/actions';

const { sharedSelectors, sharedActions } = fromShared;

const defaultError: string = 'Something went wrong, verify file contents and try again';

@Component({
  selector: 'app-audit-batch-upload',
  templateUrl: './audit-batch-upload.component.html',
  styleUrls: ['./audit-batch-upload.component.scss'],
})
export class AuditBatchUploadStepComponent extends ValidationForm implements OnInit, OnDestroy {
  private channel: Channel;
  // eslint-disable-next-line no-restricted-globals
  readonly pusherEvents = Object.keys(DocumentImportLoading).filter(key => !isNaN(Number(DocumentImportLoading[key.toString()])));

  private ngUnsubscribe$ = new Subject<void>();

  public state$ = this.store.select(auditBatchModalState);
  public state;

  public documentImport: DocumentImport;

  public form: UntypedFormGroup;
  public selectedFile: File;
  public allowedExtensions$ = this.store.select(sharedSelectors.commonSelectors.allowedFileExtensions);

  private validatingRatio: number = 0.3;
  private validatingPercentage: number = 0;

  public previewStatus$ = this.store.select(auditBatchModalSelectors.previewStatus);
  public previewStatus: PreviewStatus;
  readonly previewStatuses = PreviewStatus;

  public isFailed$ = this.store.select(auditBatchModalSelectors.isFailed);
  public isFailed: boolean;

  public auditRun$ = this.store.select(auditBatchModalSelectors.auditRun);
  private auditRun: AuditRun;

  public isOriginalFileUploaded: boolean = false;

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  constructor(
    private fb: UntypedFormBuilder,
    private readonly store: Store<AuditorState>,
    private pusher: PusherService,
    private readonly enumToArrayPipe: EnumToArrayPipe,
  ) {
    super();
  }

  ngOnInit() {
    this.createForm();

    this.initValues();
    this.loadExtensions();

    this.state$.pipe(
      filter(state => !!state),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(state => {
      this.state = state;
    });
  }

  private initValues(): void {
    this.isFailed$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(result => this.isFailed = result);

    this.auditRun$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(auditRun => {
      if (!this.auditRun?.id && !!auditRun?.id && !!this.previewStatus) {
        this.validateDocument(auditRun.id);
      }
      this.auditRun = auditRun;
      this.isOriginalFileUploaded = !!auditRun?.inputDocument?.id && !this.isFailed;
      this.selectedFile = auditRun?.inputDocument?.fileContent;
    });

    this.previewStatus$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(result => {
      if (this.previewStatus !== result) {
        switch (result) {
          case PreviewStatus.Start:
            this.auditRunCreate();
            break;
          case PreviewStatus.Validating:
            break;
          case PreviewStatus.Running:
            this.runPreview(this.auditRun.id);
            break;
          default:
            break;
        }
      }
      this.previewStatus = result;
    });
  }

  private loadExtensions(): void {
    this.store.dispatch(sharedActions.commonActions.GetMimeTypes());
  }

  onFilesSelected(files: File[]): void {
    this.selectedFile = files[0] || null;
    this.updateState();
  }

  private createForm() {
    this.form = this.fb.group({});

    this.form.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(() => {
        this.updateState();
      });
  }

  private updateState(): void {
    if (!super.validate() || !this.selectedFile) {
      this.store.dispatch(auditBatchModalActions.SetSelectedFile({ selectedFile: null }));
      return;
    }

    this.store.dispatch(auditBatchModalActions.SetSelectedFile({ selectedFile: this.selectedFile }));
  }

  private auditRunCreate(): void {
    const auditRunCreation : AuditRunCreation = {
      auditDocImportTemplateId: this.auditRun.auditDocImportTemplate.id,
      runStatusId: AuditBatchUploading.Ignored,
      isPreview: true,
      duplicateDetectionEnable: JSON.parse(this.auditRun.runSettings).DuplicateDetectionEnable,
      batchNumber: this.auditRun.batchNumber,
    };

    this.store.dispatch(auditBatchModalActions.CreateAuditRun({ auditRunCreation }));
  }

  private validateDocument(auditRunId: number): void {
    const job: Job = {
      entityId: auditRunId,
      entityTypeId: EntityTypeEnum.AuditBatches,
      description: 'Audit Document Import Job',
      scheduleType: null,
      id: 0,
      statusId: 0,
      statusMessage: null,
    };

    const channelName = StringHelper.generateChannelName(
      JobNameEnum.UploadAuditDocument,
      auditRunId,
      EntityTypeEnum.AuditBatches,
    );

    this.documentImport = new DocumentImport({
      channelName,
      documentTypeId: DocumentType.InputDocument,
      entityId: auditRunId,
      entityTypeId: EntityTypeEnum.AuditBatches,
      fileContent: this.selectedFile,
      job,
      templateId: this.auditRun.auditDocImportTemplate.documentImportTemplateId,
    });

    if (this.auditRun.existedFileId) {
      const extension = FileHelper.getExtension(this.auditRun.inputDocument.filePath);
      this.documentImport.mimeType = new MimeType({ extension });
      this.documentImport.fileContent = null;
      this.documentImport.fileName = this.auditRun.inputDocument.fileContent.name;
      this.documentImport.existedFileId = this.auditRun.existedFileId;
    }

    this.subscribeToValidationPusher(this.documentImport.channelName, () => {
      this.store.dispatch(auditBatchModalActions.ValidateAuditDocument({ file: this.documentImport.fileContent, documentImport: this.documentImport }));
    });
  }

  private runPreview(auditRunId: number) : void {
    const channelName = StringHelper.generateChannelName(
      JobNameEnum.RunAuditPreview,
      auditRunId,
      EntityTypeEnum.AuditBatches,
    );

    const runAuditorCommand: RunAuditorCommand = {
      auditRunId,
      pusherChannelName: channelName,
    };

    this.subscribeToPreviewingPusher(channelName, () => {
      this.store.dispatch(auditBatchModalActions.RunAuditor({ runAuditorCommand, approve: false }));
    });
  }

  private unsubscribeFromChannel(): void {
    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
      this.channel = null;
    }
  }

  private subscribeToValidationPusher(channelName: string, onSubscribedCallback: () => void = null) {
    this.unsubscribeFromChannel();

    this.channel = this.pusher.subscribeChannel(
      channelName,
      this.pusherEvents,
      this.validatingPusherCallback.bind(this),
      onSubscribedCallback,
    );
  }

  private validatingPusherCallback(data: GridPusherMessage, event): void {
    if (event === DocumentImportLoading[DocumentImportLoading.Validating]) {
      if (data.CurrentPercentage) { this.validatingPercentage = this.validatingRatio * data.CurrentPercentage; }
      this.store.dispatch(sharedActions.uploadBulkDocumentActions.SetProgressValues({
        progressValues:
        {
          progressWidth: `${this.validatingPercentage}%`,
          progressValue: <any> this.validatingPercentage,
        },
      }));
    }
    switch (event) {
      case DocumentImportLoading[DocumentImportLoading.Error]:
        this.unsubscribeFromChannel();
        this.displayError(data.ErrorMessage);
        break;
      case DocumentImportLoading[DocumentImportLoading.Pending]:
        this.store.dispatch(auditBatchModalActions.RunPreview());
        break;
        // no default
    }
  }

  private displayError(message?: string) {
    this.store.dispatch(auditBatchModalActions.ResetOnErrorState());
    this.store.dispatch(auditBatchModalActions.Error({ error: message ?? defaultError }));
  }

  private resetProgressBar() {
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.ResetProgressValues());
  }

  private subscribeToPreviewingPusher(channelName: string, onSubscribedCallback: () => void = null) {
    this.unsubscribeFromChannel();

    this.channel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArrayPipe.transformForStringKeys(AuditBatchUploading).map(item => item.id.toString()),
      this.previewingPusherCallback.bind(this),
      onSubscribedCallback,
    );
  }

  private previewingPusherCallback(data: AuditorPusherMessage, event): void {
    if (data.ProcessedRowsCount && data.TotalRowsCount) {
      const currentPercentage = (this.validatingRatio + (1 - this.validatingRatio) * ((data.ProcessedRowsCount + 1) / data.TotalRowsCount)) * 100;
      this.store.dispatch(sharedActions.uploadBulkDocumentActions.SetProgressValues({
        progressValues:
        {
          progressWidth: `${currentPercentage}%`,
          progressValue: <any>currentPercentage,
        },
      }));
    }

    const eventValue = Number(event);

    if (eventValue === AuditBatchUploading.Completed) {
      this.unsubscribeFromChannel();
      this.store.dispatch(auditBatchModalActions.ShowAuditResults({
        auditRun: {
          ...this.auditRun,
          resultDocument: new Document({ id: data.ResultDocId }),
        },
      }));
    }

    if (eventValue === AuditBatchUploading.CompletedWithErrors) {
      this.unsubscribeFromChannel();
      this.displayError(data.ErrorMessage);
    }

    if ([AuditBatchUploading.Completed, AuditBatchUploading.CompletedWithErrors].includes(eventValue)) {
      this.store.dispatch(auditBatchModalActions.RefreshAuditRunGrid());
    }
  }

  ngOnDestroy() {
    this.resetProgressBar();
    this.unsubscribeFromChannel();

    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
