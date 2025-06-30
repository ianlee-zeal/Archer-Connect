import { Component, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ActionsSubject, Store } from '@ngrx/store';

import { filter, first, takeUntil } from 'rxjs/operators';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ofType } from '@ngrx/effects';
import isString from 'lodash-es/isString';
import { Subject } from 'rxjs';
import { PusherService } from '@app/services/pusher.service';
import { EntityTypeEnum, FileImportReviewTabs, JobNameEnum } from '@app/models/enums';
import { Channel } from 'pusher-js';
import { SearchOptionsHelper, StringHelper } from '@app/helpers';
import { BatchActionStatus } from '@app/models/enums/batch-action/batch-action-status.enum';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { LogService } from '@app/services/log-service';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { IGridLocalData } from '@app/state/root.state';
import { GridId } from '@app/models/enums/grid-id.enum';
import * as rootSelectors from '@app/state/index';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import { BatchAction, BatchActionDto } from '@app/models/batch-action/batch-action';
import { BatchActionTemplate } from '@app/models/enums/batch-action/batch-action-template.enum';
import { MessageService, ModalService } from '@app/services';
import { GridPusherMessage } from '@app/models/documents/grid-pusher-message';
import { FileImportTab } from '@app/models/file-imports';
import * as docActions from '@app/modules/shared/state/upload-bulk-document/actions';
import * as claimantSummarySelectors from '../project-disbursement-claimant-summary/state/selectors';
import { UpdateByActionTemplateIdReviewComponent } from './update-by-action-template-id-review/update-by-action-template-id-review.component';
import { ProjectsCommonState } from '../state/reducer';
import * as claimantSelectors from '../../claimants/claimant-details/state/selectors';
import * as projectActions from '../state/actions';
import { ProgressBarModalComponent } from './progress-bar-modal/progress-bar-modal.component';
import { FilterModel } from '@app/models/advanced-search/filter-model';

enum Stages {
  SelectedClaimants = 1,
  Review = 2,
  Results = 3,
}

@Component({
  selector: 'app-update-by-action-template-id-modal',
  templateUrl: './update-by-action-template-id-modal.component.html',
})
export class UpdateByActionTemplateIdModalComponent implements OnDestroy {
  public projectId: number;
  public actionTemplateId: number;
  public dataUpdated = new EventEmitter();
  private pusherChannel: Channel;
  public batchAction: BatchAction;
  private progressModalRef: BsModalRef;
  private channelName: string;
  public batchActionTemplates = BatchActionTemplate;

  @ViewChild(UpdateByActionTemplateIdReviewComponent)
  readonly updateByActionTemplateIdReviewStep: UpdateByActionTemplateIdReviewComponent;

  public tabsPreviewGroup: FileImportTab[];
  public tabsResultsGroup: FileImportTab[];

  public readonly validateButtonAwaitedActions = [
    projectActions.BatchUpdateLedgerStageValidationCompleted.type,
    projectActions.BatchUpdateLienDataError.type,
  ];

  public readonly validationResultsButtonAwaitedActions = [
    docActions.DownloadDocumentComplete.type,
    docActions.DownloadDocumentError.type,
  ];

  public readonly stages = Stages;
  public stage: Stages = Stages.SelectedClaimants;
  public readonly stages$ = this.store.select(claimantSelectors.ledgerStages);
  public errorText: string;
  public errorCount: number;
  public queuedCount: number;
  public validationResultsAvailable: boolean = false;
  public validationResultDocId: number;
  public resultDocId: number;
  private readonly ngUnsubscribe$ = new Subject<void>();
  private clientSummaryGridParams: IServerSideGetRowsParamsExtended;
  private clientSummaryGridLocalData: IGridLocalData;

  public form: UntypedFormGroup = new UntypedFormGroup({ stage: new UntypedFormControl(null, [Validators.required]) });

  public get disabledUpdateButton(): boolean {
    switch (this.actionTemplateId) {
      case BatchActionTemplate.UpdateLedgerLienData:
      case BatchActionTemplate.SyncProbateSpiWithLedger:
        return !!this.errorText || (this.errorCount > 0 && !this.queuedCount);
      default: return false;
    }
  }

  constructor(
    public modal: BsModalRef,
    public store: Store<ProjectsCommonState>,
    private actionsSubj: ActionsSubject,
    public pusher: PusherService,
    private enumToArray: EnumToArrayPipe,
    private logger: LogService,
    private modalService: ModalService,
    private messageService: MessageService,
  ) {
  }

  public ngOnInit(): void {
    this.subscribeToActions();
    this.subscribeToClientSummaryGridParams();
    this.subscribeToClientSummaryGridLocalData();
  }

  public onChangeMode(stage: Stages): void {
    this.errorText = null;
    switch (stage) {
      case Stages.Review:
        this.onValidate();
        break;
      case Stages.Results:
        this.approve();
        break;
    }
  }

  public onCancel(stage: Stages): void {
    if (stage === this.stages.Results) {
      this.modal.hide();
    } else {
      this.messageService
        .showConfirmationDialog('Cancel', 'Are you sure you want to cancel?')
        .subscribe(answer => { if (answer) { this.modal.hide(); } });
    }
  }

  private subscribeToActions(): void {
    this.actionsSubj.pipe(
      ofType(projectActions.Error),
      filter(action => !isString(action.error)),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((action: any) => {
      this.errorText = action.error;
    });

    this.actionsSubj.pipe(
      ofType(projectActions.EnqueueBatchUpdateByActionTemplateIdValidationSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(action => {
      this.batchAction = action.batchAction;
    });

    this.actionsSubj.pipe(
      ofType(projectActions.HasDuplicateClaimantIdsSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(action => {
      if (action.hasDuplicateClaimantIds) {
        this.errorText = 'Selection has duplicate Client Ids';
      }
    });
  }

  public onValidationResultsClick(): void {
    this.store.dispatch(docActions.DownloadDocument({ id: this.validationResultDocId }));
  }

  public getChannelName(): string {
    switch (this.actionTemplateId) {
      case BatchActionTemplate.UpdateLedgerLienData:
        return StringHelper.generateChannelName(JobNameEnum.BatchUpdateLienDataValidation, this.projectId, EntityTypeEnum.Projects);
      case BatchActionTemplate.SyncProbateSpiWithLedger:
        return StringHelper.generateChannelName(JobNameEnum.SyncProbateSpiWithLedger, this.projectId, EntityTypeEnum.Projects);
      default: return null;
    }
  }

  private approve(): void {
    this.errorText = null;
    this.unsubscribePusherChannel();
    this.pusherChannel = this.pusher.subscribeChannel(
      this.channelName,
      this.enumToArray.transform(BatchActionStatus).map(i => i.name),
      this.resultsChannelEventHandler.bind(this),
      this.enqueueBatchUpdateByActionTemplateIdResults.bind(this, this.channelName),
    );
    this.progressModalRef = this.modalService.show(ProgressBarModalComponent, { initialState: { channelName: this.channelName } });
  }

  private onValidate() {
    this.errorText = null;
    this.unsubscribePusherChannel();
    this.channelName = this.getChannelName();
    this.pusherChannel = this.pusher.subscribeChannel(
      this.channelName,
      this.enumToArray.transform(BatchActionStatus).map(i => i.name),
      this.validationChannelEventHandler.bind(this),
      this.enqueueBatchUpdateByActionTemplateIdValidation.bind(this, this.channelName),
    );
    this.progressModalRef = this.modalService.show(ProgressBarModalComponent, { initialState: { channelName: this.channelName } });
  }

  private validationChannelEventHandler(data: GridPusherMessage, event: string): void {
    this.errorCount = 0;
    switch (BatchActionStatus[event]) {
      case BatchActionStatus.Complete: {
        this.errorCount = data.Errored;
        this.queuedCount = data.Successful;
        this.validationResultDocId = data.PreviewDocId;
        this.store.dispatch(projectActions.BatchUpdateLedgerStageValidationCompleted());
        this.progressModalRef.hide();
        this.generatePreviewTabsGroup(data);
        this.stage = Stages.Review;
        break;
      }
      case BatchActionStatus.Error:
        this.logger.log('[validationChannelEventHandler]', data);
        this.errorText = data.ErrorMessage;
        this.store.dispatch(projectActions.BatchUpdateLienDataError());
        this.progressModalRef.hide();
        break;
      default:
        break;
    }
  }

  private resultsChannelEventHandler(data: GridPusherMessage, event: string): void {
    switch (BatchActionStatus[event]) {
      case BatchActionStatus.Complete: {
        this.resultDocId = data.ResultDocId;
        this.store.dispatch(projectActions.BatchUpdateLedgerStageValidationCompleted());
        this.progressModalRef.hide();
        this.generateResultsTabsGroup(data);
        this.stage = Stages.Results;
        break;
      }
      case BatchActionStatus.Error:
        this.logger.log('[validationChannelEventHandler]', data);
        this.errorText = data.ErrorMessage;
        this.store.dispatch(projectActions.BatchUpdateLienDataError());
        this.progressModalRef.hide();
        break;
      default:
        break;
    }
  }

  private enqueueBatchUpdateByActionTemplateIdResults() {
    this.store.dispatch(projectActions.EnqueueBatchUpdateLedgerStage({ batchActionId: this.batchAction.id }));
  }

  private enqueueBatchUpdateByActionTemplateIdValidation(channelName: string): void {
    const searchOptions = SearchOptionsHelper.createSearchOptions(this.clientSummaryGridLocalData, this.clientSummaryGridParams);
    searchOptions.startRow = 0;
    searchOptions.endRow = -1;
    searchOptions.filterModel = [
      ...searchOptions.filterModel,
      new FilterModel({ filter: 0, filterType: FilterTypes.Number, type: 'greaterThan', key: 'claimSettlementLedgerId' }),
      new FilterModel({ filter: true, filterType: FilterTypes.Boolean, type: 'equals', key: 'disbursementGroupActive' }),
    ];

    const updateByActionTemplateIdParam = { searchOptions };

    const batchAction: BatchActionDto = {
      entityId: this.projectId,
      entityTypeId: EntityTypeEnum.Projects,
      batchActionFilters: [{ filter: JSON.stringify(updateByActionTemplateIdParam) }],
      pusherChannelName: channelName,
      batchActionTemplateId: this.actionTemplateId,
    };
    this.store.dispatch(projectActions.EnqueueBatchUpdateByActionTemplateIdValidation({ batchAction }));
  }

  private unsubscribePusherChannel(): void {
    if (this.pusherChannel) {
      this.pusher.unsubscribeChannel(this.pusherChannel);
    }
  }

  private subscribeToClientSummaryGridParams(): void {
    this.store.select(claimantSummarySelectors.gridParams)
      .pipe(first())
      .subscribe(params => {
        this.clientSummaryGridParams = params;
      });
  }

  private subscribeToClientSummaryGridLocalData(): void {
    this.store.select(rootSelectors.gridLocalDataByGridId({ gridId: GridId.ClaimantSummaryList }))
      .pipe(first())
      .subscribe(data => {
        this.clientSummaryGridLocalData = data;
        if (this.actionTemplateId !== BatchActionTemplate.SyncProbateSpiWithLedger) {
          this.dispatchCheckingDuplicateClaimantIds();
        }
      });
  }

  private dispatchCheckingDuplicateClaimantIds() {
    const searchOptions = SearchOptionsHelper.createSearchOptions(this.clientSummaryGridLocalData, this.clientSummaryGridParams);
    searchOptions.filterModel = [
      ...searchOptions.filterModel,
      new FilterModel({ filter: this.projectId, filterType: FilterTypes.Number, type: 'equals', key: 'caseId' }),
    ];
    this.store.dispatch(projectActions.HasDuplicateClaimantIdsRequest({ searchOptions }));
  }

  private generatePreviewTabsGroup(data: GridPusherMessage): void {
    this.batchAction.countTotal = data.Total;
    this.batchAction.countErrored = data.Errored;
    this.batchAction.countWarned = data.Warned;
    this.batchAction.countSuccessful = data.Successful;
    this.tabsPreviewGroup = [
      {
        tab: FileImportReviewTabs.AllRecords,
        title: 'All Records',
        count: this.batchAction.countTotal,
      },
      {
        tab: FileImportReviewTabs.Errors,
        title: 'Errors',
        count: this.batchAction.countErrored,
      },
      {
        tab: FileImportReviewTabs.Warnings,
        title: 'Warnings',
        count: this.batchAction.countWarned,
      },
      {
        tab: FileImportReviewTabs.Queued,
        title: 'Queued',
        count: this.batchAction.countSuccessful,
      },
    ];
  }

  private generateResultsTabsGroup(data: GridPusherMessage): void {
    this.batchAction.countTotal = data.Total;
    this.batchAction.countErrored = data.Errored;
    this.batchAction.countWarned = data.Warned;
    this.batchAction.countLoaded = data.Enqueued;
    this.tabsResultsGroup = [
      {
        tab: FileImportReviewTabs.AllRecords,
        title: 'All Records',
        count: this.batchAction.countTotal,
      },
      {
        tab: FileImportReviewTabs.Inserts,
        title: 'Successful',
        count: this.batchAction.countSuccessful,
      },
      {
        tab: FileImportReviewTabs.Errors,
        title: 'Errors',
        count: this.batchAction.countErrored,
      },
      {
        tab: FileImportReviewTabs.Warnings,
        title: 'Warnings',
        count: this.batchAction.countWarned,
      },

    ];
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
