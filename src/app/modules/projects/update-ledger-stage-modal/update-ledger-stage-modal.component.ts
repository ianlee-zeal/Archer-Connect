import { Component, EventEmitter, OnDestroy } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ActionsSubject, Store } from '@ngrx/store';

import { first, takeUntil } from 'rxjs/operators';
import * as rootSelectors from '@app/state/index';
import { GridId } from '@app/models/enums/grid-id.enum';
import { SearchOptionsHelper, StringHelper } from '@app/helpers';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ILedgerStageUpdateRequestDto } from '@app/models/closing-statement/ledger-stage-update-request';
import { ofType } from '@ngrx/effects';
import { IGridLocalData } from '@app/state/root.state';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { Observable, Subject } from 'rxjs';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import { ClaimSettlementLedgerStages, EntityTypeEnum, JobNameEnum } from '@app/models/enums';
import { PusherService } from '@app/services/pusher.service';
import { LogService } from '@app/services/log-service';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { Channel } from 'pusher-js';
import { BatchAction, BatchActionDto } from '@app/models/batch-action/batch-action';
import * as docActions from '@app/modules/shared/state/upload-bulk-document/actions';
import { BatchActionTemplate } from '@app/models/enums/batch-action/batch-action-template.enum';
import { BatchActionStatus } from '@app/models/enums/batch-action/batch-action-status.enum';
import * as commonActions from '@app/modules/shared/state/common.actions';
import { BatchActionReviewOption } from '@app/models/batch-action/batch-action-review-option';
import { BatchActionDocumentType } from '@app/models/enums/batch-action/batch-action-document-type.enum';
import * as projectActions from '../state/actions';
import * as projectSelectors from '../state/selectors';
import * as claimantSummarySelectors from '../project-disbursement-claimant-summary/state/selectors';
import * as claimantActions from '../../claimants/claimant-details/state/actions';
import * as claimantSelectors from '../../claimants/claimant-details/state/selectors';
import { ProjectsCommonState } from '../state/reducer';
import { MessageService } from '../../../services';
import { FilterModel } from '@app/models/advanced-search/filter-model';

enum Step {
  SelectedClaimants = 1,
  SelectStage = 2,
  DeficiencySummary = 3,
}

@Component({
  selector: 'app-update-ledger-stage-modal',
  templateUrl: './update-ledger-stage-modal.component.html',
})
export class UpdateLedgerStageModalComponent implements OnDestroy {
  public projectId: number;
  public stagesUpdated = new EventEmitter();

  public readonly validateButtonAwaitedActions = [
    projectActions.BatchUpdateLedgerStageValidationCompleted.type,
    projectActions.BatchUpdateLedgerStageError.type,
  ];

  public readonly updateButtonAwaitedActions = [
    projectActions.BatchUpdateLedgerStageValidationCompleted.type,
    projectActions.BatchUpdateLedgerStageError.type,
    commonActions.Cancel,
  ];

  public readonly validationResultsButtonAwaitedActions = [
    docActions.DownloadDocumentComplete.type,
    docActions.DownloadDocumentError.type,
  ];

  readonly criticalDeficiencies$: Observable<BatchActionReviewOption[]> = this.store.select(projectSelectors.criticalActionDeficienciesReview);
  readonly totalErroredLedgers$: Observable<number> = this.store.select(projectSelectors.totalErroredLedgers);
  readonly totalValidatedLedgers$: Observable<number> = this.store.select(projectSelectors.totalValidatedLedgers);
  readonly error$: Observable<string> = this.store.select(projectSelectors.error);

  public readonly steps = Step;
  public step: Step = Step.SelectedClaimants;
  public readonly stages$ = this.store.select(claimantSelectors.ledgerStages);
  public validationResultsAvailable: boolean = false;
  public validationResultDocId: number;
  private readonly ngUnsubscribe$ = new Subject<void>();
  private clientSummaryGridParams: IServerSideGetRowsParamsExtended;
  private clientSummaryGridLocalData: IGridLocalData;
  private pusherChannel: Channel;
  public batchAction: BatchAction;
  public isDeficienciesReviewLoading = false;

  public form: UntypedFormGroup = new UntypedFormGroup({ stage: new UntypedFormControl(null, [Validators.required]) });

  constructor(
    public modal: BsModalRef,
    public store: Store<ProjectsCommonState>,
    private actionsSubj: ActionsSubject,
    public pusher: PusherService,
    private messageService: MessageService,
    private enumToArray: EnumToArrayPipe,
    private logger: LogService,
  ) {
  }

  public ngOnInit(): void {
    this.subscribeToActions();
    this.subscribeToClientSummaryGridParams();
    this.subscribeToClientSummaryGridLocalData();
    this.store.dispatch(claimantActions.GetLedgerStages());
  }

  public onValidate(): void {
    this.store.dispatch(projectActions.ResetError());
    this.unsubscribePusherChannel();
    const channelName = StringHelper.generateChannelName(JobNameEnum.BatchUpdateLedgerStageValidation, this.projectId, EntityTypeEnum.Projects);
    this.pusherChannel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(BatchActionStatus).map(i => i.name),
      this.validationChannelEventHandler.bind(this),
      this.enqueueBatchUpdateLedgerStageValidation.bind(this, channelName),
    );
  }

  public onUpdate(): void {
    const finalizedStages = [ClaimSettlementLedgerStages.NetDisbursementFinalized, ClaimSettlementLedgerStages.DWFinalized];
    if (finalizedStages.indexOf(this.form.value.stage.id) > 0) {
      this.messageService.showConfirmationDialog(
        'Confirm operation',
        'Ledger entries will be updated to payment auth. and locked for editing amounts Are you sure you want to proceed?',
      )
        .subscribe(answer => {
          if (answer) {
            this.update();
          } else {
            this.store.dispatch(commonActions.Cancel());
          }
        });
    } else this.update();
  }

  private update(): void {
    this.store.dispatch(projectActions.ResetError());
    this.unsubscribePusherChannel();
    const channelName = this.batchAction.channelName;
    this.pusherChannel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(BatchActionStatus).map(i => i.name),
      this.updateChannelEventHandler.bind(this),
      this.enqueueBatchUpdateLedgerStage.bind(this),
    );
  }

  public onChangeMode(step: Step): void {
    this.store.dispatch(projectActions.ResetError());
    this.step = step;
  }

  public onValidationResultsClick(): void {
    this.store.dispatch(docActions.DownloadDocument({ id: this.validationResultDocId }));
  }

  private enqueueBatchUpdateLedgerStageValidation(channelName: string): void {
    const searchOptions = SearchOptionsHelper.createSearchOptions(this.clientSummaryGridLocalData, this.clientSummaryGridParams);
    searchOptions.startRow = 0;
    searchOptions.endRow = -1;
    searchOptions.filterModel = [
      ...searchOptions.filterModel,
      new FilterModel({ filter: 0, filterType: FilterTypes.Number, type: 'greaterThan', key: 'claimSettlementLedgerId' }),
      new FilterModel({ filter: true, filterType: FilterTypes.Boolean, type: 'equals', key: 'disbursementGroupActive' }),
    ];

    const updateLedgerStageParam: ILedgerStageUpdateRequestDto = {
      caseId: this.projectId,
      searchOptions,
      stageId: this.form.value.stage.id,
    };

    const batchAction: BatchActionDto = {
      entityId: this.projectId,
      entityTypeId: EntityTypeEnum.Projects,
      batchActionFilters: [{ filter: JSON.stringify(updateLedgerStageParam) }],
      pusherChannelName: channelName,
      batchActionTemplateId: BatchActionTemplate.LedgerStageUpdate,
    };

    this.store.dispatch(projectActions.EnqueueBatchUpdateLedgerStageValidation({ batchAction }));
  }

  private enqueueBatchUpdateLedgerStage(): void {
    this.store.dispatch(projectActions.EnqueueBatchUpdateLedgerStageSelection({ batchActionId: this.batchAction.id }));
  }

  private validationChannelEventHandler(data: any, event: string): void {
    switch (BatchActionStatus[event]) {
      case BatchActionStatus.Complete: {
        this.validationResultDocId = data.PreviewDocId;
        this.store.dispatch(projectActions.BatchUpdateLedgerStageValidationCompleted());
        this.store.dispatch(projectActions.GetBatchActionDeficienciesRequest({
          batchActionId: this.batchAction.id,
          documentTypeId: BatchActionDocumentType.PreviewValidation,
        }));
        this.isDeficienciesReviewLoading = true;
        this.step = Step.DeficiencySummary;
        break;
      }
      case BatchActionStatus.Error:
        this.logger.log('[validationChannelEventHandler]', data);
        this.step = Step.DeficiencySummary;
        this.store.dispatch(projectActions.BatchUpdateLedgerStageError({ errorMessage: data.ErrorMessage, bsModalRef: this.modal }));
        break;
      default:
        break;
    }
  }

  private updateChannelEventHandler(data: any, event: string): void {
    switch (BatchActionStatus[event]) {
      case BatchActionStatus.Complete: {
        this.modal.hide();
        this.stagesUpdated.emit();
        break;
      }
      case BatchActionStatus.Error:
        this.logger.log('[updateChannelEventHandler]', data);
        this.store.dispatch(projectActions.BatchUpdateLedgerStageError({ errorMessage: data.ErrorMessage, bsModalRef: this.modal }));
        break;
      default:
        break;
    }
  }

  private unsubscribePusherChannel(): void {
    if (this.pusherChannel) {
      this.pusher.unsubscribeChannel(this.pusherChannel);
    }
  }

  private subscribeToActions(): void {
    this.actionsSubj.pipe(
      ofType(projectActions.EnqueueBatchUpdateLedgerStageValidationSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(action => {
      this.batchAction = action.batchAction;
    });

    this.actionsSubj.pipe(
      ofType(projectActions.GetBatchActionDeficienciesSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => {
      this.isDeficienciesReviewLoading = false;
    });
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
      });
  }

  public ngOnDestroy(): void {
    this.unsubscribePusherChannel();
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
