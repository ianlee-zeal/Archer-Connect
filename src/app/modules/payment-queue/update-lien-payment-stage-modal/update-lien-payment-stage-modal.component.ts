import { Component, EventEmitter, OnDestroy } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ActionsSubject, Store } from '@ngrx/store';

import { first, takeUntil } from 'rxjs/operators';
import * as rootSelectors from '@app/state/index';
import { GridId } from '@app/models/enums/grid-id.enum';
import { SearchOptionsHelper, StringHelper } from '@app/helpers';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ofType } from '@ngrx/effects';
import { IGridLocalData } from '@app/state/root.state';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { Observable, Subject } from 'rxjs';
import { EntityTypeEnum, JobNameEnum } from '@app/models/enums';
import { PusherService } from '@app/services/pusher.service';
import { LogService } from '@app/services/log-service';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { Channel } from 'pusher-js';
import { BatchAction, BatchActionDto } from '@app/models/batch-action/batch-action';
import * as docActions from '@app/modules/shared/state/upload-bulk-document/actions';
import { BatchActionTemplate } from '@app/models/enums/batch-action/batch-action-template.enum';
import { BatchActionStatus } from '@app/models/enums/batch-action/batch-action-status.enum';
import { ILienPaymentStageUpdateRequestDto } from '@app/models/closing-statement/lien-payment-stage-update-request';
import { TypedAction } from '@ngrx/store/src/models';
import { ClearSelectedRecordsState } from '@app/state/root.actions';
import * as paymentQueueActions from '../../projects/project-disbursement-payment-queue/state/actions';
import * as paymentQueueSelectors from '../../projects/project-disbursement-payment-queue/state/selectors';
import { ProjectsCommonState } from '../../projects/state/reducer';
import * as globalPaymentQueueActions from '../state/actions';

enum Step {
  SelectedEntries = 1,
  SelectStage = 2,
  Results = 3,
}

@Component({
  selector: 'app-update-lien-payment-stage-modal',
  templateUrl: './update-lien-payment-stage-modal.component.html',
})
export class UpdateLienPaymentStageModalComponent implements OnDestroy {
  public gridId: GridId;
  public gridParams$: Observable<IServerSideGetRowsParamsExtended>;
  public stagesUpdated = new EventEmitter();
  public projectId: number;
  public labelText: string = 'Payment Queue';

  public readonly validateButtonAwaitedActions = [
    globalPaymentQueueActions.BatchUpdateLienPaymentStageValidationCompleted.type,
    globalPaymentQueueActions.BatchUpdateLienPaymentStageError.type,
  ];

  public readonly validationResultsButtonAwaitedActions = [
    docActions.DownloadDocumentComplete.type,
    docActions.DownloadDocumentError.type,
  ];

  public readonly steps = Step;
  public step: Step = Step.SelectedEntries;
  public stageId: number;
  public canClickNext: boolean = false;
  public form: UntypedFormGroup = new UntypedFormGroup({ stage: new UntypedFormControl(null, [Validators.required]) });
  private readonly ngUnsubscribe$ = new Subject<void>();

  public readonly stages$ = this.store.select(paymentQueueSelectors.activeLienPaymentStages);
  public readonly selectedPaymentQueueGrid$ = this.store.select(paymentQueueSelectors.selectedPaymentQueueGrid);

  public validationResultDocId: number;
  public resultDocId: number;

  private paymentQueueGridParams: IServerSideGetRowsParamsExtended;
  private paymentQueueGridLocalData: IGridLocalData;
  private pusherChannel: Channel;
  public batchAction: BatchAction;
  public isValidationResultLoading = false;

  constructor(
    public modal: BsModalRef,
    public store: Store<ProjectsCommonState>,
    private actionsSubj: ActionsSubject,
    public pusher: PusherService,
    private enumToArray: EnumToArrayPipe,
    private logger: LogService,
  ) {
  }

  public ngOnInit(): void {
    this.subscribeToActions();
    this.subscribeToPaymentQueueGridParams();
    this.subscribeToPaymentQueueGridLocalData();
    this.store.dispatch(paymentQueueActions.GetActiveLienPaymentStages());
  }

  public onValidate(): void {
    this.unsubscribePusherChannel();
    const channelName = StringHelper.generateChannelName(JobNameEnum.UpdateLienPaymentStageValidation);
    this.pusherChannel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(BatchActionStatus).map((i: { id: number; name: string }) => i.name),
      this.validationChannelEventHandler.bind(this),
      this.enqueueUpdateLienPaymentStageValidation.bind(this, channelName),
    );
  }

  public onChangeMode(step: Step): void {
    this.step = step;
  }

  public onValidationResultsClick(): void {
    this.store.dispatch(docActions.DownloadDocument({ id: this.validationResultDocId }));
  }

  private enqueueUpdateLienPaymentStageValidation(channelName: string): void {
    const searchOptions = SearchOptionsHelper.createSearchOptions(this.paymentQueueGridLocalData, this.paymentQueueGridParams);
    searchOptions.startRow = 0;
    searchOptions.endRow = -1;
    this.stageId = this.form.value.stage.id;

    const updateLienPaymentStageParam: ILienPaymentStageUpdateRequestDto = {
      searchOptions,
      stageId: this.form.value.stage.id,
    };

    const batchAction: BatchActionDto = {
      entityTypeId: this.projectId ? EntityTypeEnum.Projects : 0,
      entityId: this.projectId || 0,
      batchActionFilters: [{ filter: JSON.stringify(updateLienPaymentStageParam) }],
      pusherChannelName: channelName,
      batchActionTemplateId: BatchActionTemplate.UpdateLienPaymentStage,
    };

    this.store.dispatch(globalPaymentQueueActions.EnqueueUpdateLienPaymentStageValidation({ batchAction }));
  }

  private validationChannelEventHandler(data: any, event: string): void {
    switch (BatchActionStatus[event]) {
      case BatchActionStatus.Complete: {
        this.approve();
        break;
      }
      case BatchActionStatus.Error:
        this.logger.log('[validationChannelEventHandler]', data);
        this.store.dispatch(globalPaymentQueueActions.BatchUpdateLienPaymentStageError({ errorMessage: data.ErrorMessage, bsModalRef: this.modal }));
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
        this.validationResultDocId = data.PreviewDocId;
        this.store.dispatch(globalPaymentQueueActions.BatchUpdateLienPaymentStageValidationCompleted());
        this.stagesUpdated.emit();
        this.isValidationResultLoading = true;
        this.step = Step.Results;
        break;
      }
      case BatchActionStatus.Error:
        this.logger.log('[resultsChannelEventHandler]', data);
        this.store.dispatch(globalPaymentQueueActions.BatchUpdateLienPaymentStageError({ errorMessage: data.ErrorMessage, bsModalRef: this.modal }));
        break;
      default:
        break;
    }
  }

  private enqueueBatchUpdateByActionTemplateIdResults(): void {
    this.store.dispatch(globalPaymentQueueActions.EnqueueUpdateLienPaymentStage({ batchActionId: this.batchAction.id }));
  }

  private unsubscribePusherChannel(): void {
    if (this.pusherChannel) {
      this.pusher.unsubscribeChannel(this.pusherChannel);
    }
  }

  private subscribeToActions(): void {
    this.actionsSubj.pipe(
      ofType(globalPaymentQueueActions.EnqueueUpdateLienPaymentStageValidationSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((action: { batchAction: BatchAction; } & TypedAction<string>) => {
      this.batchAction = action.batchAction;
    });

    this.actionsSubj.pipe(
      ofType(globalPaymentQueueActions.GetBatchActionLienPaymentStageValidationResultSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => {
      this.isValidationResultLoading = false;
    });
  }

  private subscribeToPaymentQueueGridParams(): void {
    this.gridParams$.pipe(first())
      .subscribe((params: any) => {
        this.paymentQueueGridParams = params;
      });
  }

  private subscribeToPaymentQueueGridLocalData(): void {
    this.store.select(rootSelectors.gridLocalDataByGridId({ gridId: this.gridId }))
      .pipe(first())
      .subscribe((data: IGridLocalData) => {
        this.paymentQueueGridLocalData = data;
      });
  }

  public ngOnDestroy(): void {
    this.unsubscribePusherChannel();
    this.store.dispatch(ClearSelectedRecordsState({ gridId: this.gridId }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
