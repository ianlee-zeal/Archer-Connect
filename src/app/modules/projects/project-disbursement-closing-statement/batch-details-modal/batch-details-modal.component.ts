import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GridId } from '@app/models/enums/grid-id.enum';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ActionsSubject, Store } from '@ngrx/store';
import * as fromShared from '@app/state';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { PermissionService } from '@app/services';
import { EntityTypeEnum, JobNameEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { BatchDetails } from '@app/models/closing-statement/batch-details';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { SelectHelper } from '@app/helpers/select.helper';
import { QCStatusEnum } from '@app/models/enums/qcstatus-status.enum';
import { Channel } from 'pusher-js';
import { PusherService } from '@app/services/pusher.service';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { StringHelper } from '@app/helpers';
import { BatchActionStatus } from '@app/models/enums/batch-action/batch-action-status.enum';
import { BatchAction, BatchActionDto } from '@app/models/batch-action/batch-action';
import { ISendDocuSignDocumentsRequest } from '@app/models/closing-statement/send-docusign-documents-request';
import { BatchActionTemplate } from '@app/models/enums/batch-action/batch-action-template.enum';
import { LogService } from '@app/services/log-service';
import { ofType } from '@ngrx/effects';
import { TypedAction } from '@ngrx/store/src/models';
import * as projectSelectors from '../../state/selectors';
import * as projectActions from '../../state/actions';
// eslint-disable-next-line import/no-cycle
import { ProjectDisbursementClosingStatementListComponent } from '../../project-disbursement-closing-statement-list/project-disbursement-closing-statement-list.component';

@Component({
  selector: 'app-batch-details-modal',
  templateUrl: './batch-details-modal.component.html',
  styleUrls: ['./batch-details-modal.component.scss'],
})
export class BatchDetailsModalComponent implements OnInit, OnDestroy {
  @Input() projectId : number;
  @Input() batchId: number;
  @Input() refreshParentGrid: () => void;
  @Input() documentId: number;

  @ViewChild(ProjectDisbursementClosingStatementListComponent) closingStatementsList: ProjectDisbursementClosingStatementListComponent;

  protected ngUnsubscribe$ = new Subject<void>();
  public readonly canSendDocuSign = this.permissionService.has(PermissionService.create(PermissionTypeEnum.ProjectsClosingStatement, PermissionActionTypeEnum.ClosingStatementSendDocuSign));
  public readonly canRejectBatch = this.permissionService.has(PermissionService.create(PermissionTypeEnum.ProjectsClosingStatement, PermissionActionTypeEnum.QCApproveRejectedBatch));
  public sendDocuSignDocumentsDisabled: boolean = true;
  public downloadLogFileDisabled: boolean = false;
  public batchDetails: BatchDetails;
  public batchAction: BatchAction;
  public batchDetailsLoading$ = this.store.select(projectSelectors.batchDetailsLoading);
  public readonly qcStatusEnumRejected = QCStatusEnum[QCStatusEnum.Rejected];
  public edpaName: string;
  public sendEDeliveryButtonDisabled$ = this.store.select(projectSelectors.sendEDeliveryButtonDisabled);

  public isMaintanence$ = this.store.select(projectSelectors.isMaintance);

  public readonly awaitedActionTypes = [
    projectActions.SendDocuSignDocumentsCompleted,
    projectActions.Error,
    projectActions.ValidateMaintenanceFailed,
  ];

  public get isQcStatusRejected(): boolean {
    return this.form.get('qcStatus').value?.id == this.qcStatusEnumRejected;
  }

  public form: UntypedFormGroup = new UntypedFormGroup({
    qcStatus: new UntypedFormControl(null, [Validators.required]),
  });

  public qcStatuses: SelectOption[] = SelectHelper.enumToOptions(QCStatusEnum, (option: SelectOption) => option.name, (option: SelectOption) => option.name);
  private pusherChannel: Channel;

  public gridId: GridId = GridId.ProjectDisbursementClosingStatementModal;
  constructor(
    protected router: Router,
    protected elementRef: ElementRef,
    public modal: BsModalRef,
    private store: Store<fromShared.AppState>,
    public readonly permissionService: PermissionService,
    protected pusher: PusherService,
    private readonly enumToArray: EnumToArrayPipe,
    private logger: LogService,
    private actionsSubj: ActionsSubject,
  ) { }

  ngOnInit(): void {

    this.actionsSubj.pipe(
      ofType(projectActions.EnqueueSendDocuSignDocumentsSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((action: { batchAction: BatchAction; } & TypedAction<string>) => {
      this.batchAction = action.batchAction;
    });

    this.actionsSubj.pipe(
      ofType(projectActions.SendDocuSignDocumentsCompleted),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => {
      this.closingStatementsList.refreshGrid();
      if (this.refreshParentGrid) {
        this.refreshParentGrid();
      }
    });

    this.store.select(projectSelectors.batchDetails)
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((batchDetails: BatchDetails) => {
        this.batchDetails = batchDetails;
        console.log("batchDetails", this.batchDetails);
        this.edpaName = this.batchDetails?.edpaName;
        this.sendDocuSignDocumentsDisabled = !this.batchDetails?.canBeSent || !this.canSendDocuSign;
        if (this.batchDetails) {
          const qcStatus = this.qcStatuses.find((s: SelectOption) => s.name == QCStatusEnum[this.batchDetails.qcStatus]);
          this.form.patchValue({ qcStatus });
          this.form.updateValueAndValidity({ emitEvent: false });
        }
      });
    this.store.dispatch(projectActions.GetBatchDetails({ caseId: this.projectId, batchId: this.batchId, documentId: this.documentId }));
    this.store.dispatch(projectActions.CheckMaintenance());

    this.actionsSubj.pipe(
      ofType(projectActions.ValidateMaintenanceCompleted),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(data => {
      if (!data.isMaintance) {
        this.unsubscribePusherChannel();
        const channelName = StringHelper.generateChannelName(JobNameEnum.SendDocuSign);
        this.pusherChannel = this.pusher.subscribeChannel(
          channelName,
          this.enumToArray.transform(BatchActionStatus).map((i: { id: number; name: string }) => i.name),
          this.validationChannelEventHandler.bind(this),
          this.enqueueSendDocuSignDocuments.bind(this, channelName),
        );
      } else {
        this.store.dispatch(projectActions.ValidateMaintenanceFailed());
      }
    });

  }


  public onQCStatusChanges(data): void {
    if (!data || !data.id) {
      return;
    }
    const qcStatus = QCStatusEnum[data.id];
    this.store.dispatch(projectActions.UpdateQcStatus({
      batchId: this.batchId,
      caseId: this.projectId,
      qcStatus: qcStatus as unknown as number,
      documentId: this.documentId,
    }));
  }

  public onSendDocuSignDocuments(): void {
    this.store.dispatch(projectActions.ValidateMaintenance());
  }

  private enqueueSendDocuSignDocuments(channelName: string): void {
    const sendDocuSignDocumentsRequest: ISendDocuSignDocumentsRequest = {
      batchId: this.batchId,
    };

    const batchAction: BatchActionDto = {
      entityTypeId: EntityTypeEnum.DocumentGeneration,
      entityId: this.batchId,
      batchActionFilters: [{ filter: JSON.stringify(sendDocuSignDocumentsRequest) }],
      pusherChannelName: channelName,
      batchActionTemplateId: BatchActionTemplate.SendDocuSignDocuments,
    };

    this.store.dispatch(projectActions.EnqueueSendDocuSignDocuments({ batchAction }));
  }

  private validationChannelEventHandler(data: any, event: string): void {
    switch (BatchActionStatus[event]) {
      case BatchActionStatus.Complete: {
        this.approve();
        break;
      }
      case BatchActionStatus.Error:
        this.logger.log('[validationChannelEventHandler]', data);
        this.store.dispatch(projectActions.Error({ error: data.ErrorMessage }));
        break;
      default:
        break;
    }
  }

  private approve(): void {
    this.unsubscribePusherChannel();
    this.pusherChannel = this.pusher.subscribeChannel(
      this.batchAction.channelName,
      this.enumToArray.transform(BatchActionStatus).map((i: { id: number; name: string }) => i.name),
      this.resultsChannelEventHandler.bind(this),
      this.enqueueBatchUpdateByActionTemplateIdResults.bind(this),
    );
  }

  private resultsChannelEventHandler(data: any, event: string): void {
    switch (BatchActionStatus[event]) {
      case BatchActionStatus.Complete: {
        this.store.dispatch(projectActions.SendDocuSignDocumentsCompleted());
        this.store.dispatch(projectActions.GetBatchDetails({ caseId: this.projectId, batchId: this.batchId, documentId: this.documentId }));
        break;
      }
      case BatchActionStatus.Error:
        this.logger.log('[resultsChannelEventHandler]', data);
        this.store.dispatch(projectActions.Error({ error: data.ErrorMessage }));
        break;
      default:
        break;
    }
  }

  private enqueueBatchUpdateByActionTemplateIdResults(): void {
    this.store.dispatch(projectActions.EnqueueApproveSendDocuSignDocuments({ batchActionId: this.batchAction.id }));
  }

  public downloadFile(): void {
    this.store.dispatch(projectActions.GetClosingStatementBatch({ batchId: this.batchId }));
  }

  public downloadLogFile(): void {
    this.store.dispatch(projectActions.DownloadClosingStatementBatchLog({ batchId: this.batchId }));
  }

  public onClose(): void {
    this.resetData();
    this.modal.hide();
  }

  public resetData(): void {
    this.sendDocuSignDocumentsDisabled = true;
    //this.downloadLogFileDisabled = true;
    this.form.reset();
  }

  private unsubscribePusherChannel(): void {
    if (this.pusherChannel) {
      this.pusher.unsubscribeChannel(this.pusherChannel);
    }
  }

  public ngOnDestroy(): void {
    this.resetData();
    this.store.dispatch(projectActions.ResetMaintenance());
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
