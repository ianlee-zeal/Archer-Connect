import { Component, EventEmitter, OnDestroy } from '@angular/core';
import { EntityTypeEnum, JobNameEnum } from '@app/models/enums';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import * as rootSelectors from '@app/state/index';
import { ActionsSubject, Store } from '@ngrx/store';
import { ProjectsCommonState } from '@app/modules/projects/state/reducer';
import { filter, first, takeUntil } from 'rxjs/operators';
import { GridId } from '@app/models/enums/grid-id.enum';
import { IGridLocalData } from '@app/state/root.state';
import * as projectActions from '@app/modules/projects/state/actions';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import * as claimantSummarySelectors from '@app/modules/projects/project-disbursement-claimant-summary/state/selectors';
import { ofType } from '@ngrx/effects';
import isString from 'lodash-es/isString';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { LogService } from '@app/services/log-service';
import { PusherService } from '@app/services/pusher.service';
import { BatchAction, BatchActionDto } from '@app/models/batch-action/batch-action';
import { Channel } from 'pusher-js';
import { BatchActionStatus } from '@app/models/enums/batch-action/batch-action-status.enum';
import { StringHelper, SearchOptionsHelper } from '@app/helpers';
import { BatchActionTemplate } from '@app/models/enums/batch-action/batch-action-template.enum';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { DateValidator } from '@app/modules/shared/_validators/date-validator';
import { IUpdateFundedDateRequest } from '@app/models/closing-statement/update-funded-date-request';
import { TypedAction } from '@ngrx/store/src/models';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import * as modalActions from '../../../state/actions';

export enum Steps {
  Main = 1,
}

@Component({
  selector: 'app-update-funded-date-modal',
  templateUrl: './update-funded-date-modal.component.html',
  styleUrls: ['./update-funded-date-modal.component.scss'],
})
export class UpdateFundedDateModalComponent implements OnDestroy {
  private ngUnsubscribe$ = new Subject<void>();
  public dataUpdated = new EventEmitter();

  public gridId: GridId = GridId.UpdateFundedDateList;
  public projectId: number;

  public errorText: string;
  public message: string;
  public isShowWarning: boolean;
  public isProcessing: boolean;
  public updatedTimes: number = 0;
  private clientSummaryGridParams: IServerSideGetRowsParamsExtended;
  private clientSummaryGridLocalData: IGridLocalData;
  private pusherChannel: Channel;
  public batchAction: BatchAction;
  public fundedDate: Date | null;

  public readonly submitButtonAwaitedActions = [
    projectActions.UpdateFundedDateApproveSuccess.type,
    projectActions.UpdateFundedDateApproveError.type,
    projectActions.UpdateFundedDateValidationError.type,
  ];

  public get isButtonDisabled() : boolean {
    return !this.form.valid || this.form.value.fundedDate == null || this.isProcessing;
  }

  public form: UntypedFormGroup = new UntypedFormGroup({
    fundedDate: new UntypedFormControl(null, this.dateValidator.valid),
  });

  constructor(
    private readonly modal: BsModalRef,
    public store: Store<ProjectsCommonState>,
    private actionsSubj: ActionsSubject,
    public pusher: PusherService,
    private readonly dateValidator: DateValidator,
    private enumToArray: EnumToArrayPipe,
    private logger: LogService,
  ) { }

  ngOnInit(): void {
    this.subscribeToClientSummaryGridLocalData();
    this.subscribeToClientSummaryGridParams();
    this.subscribeToActions();
    this.actionsSubj.pipe(
      ofType(projectActions.Error),
      filter(action => !isString(action.error)),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((action: any) => {
      this.errorText = action.error;
    });

    this.actionsSubj.pipe(
      ofType(projectActions.GetClaimantsWithLedgersListSuccess),
      filter(action => action?.result != null),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((action: any) => {
      this.isShowWarning = action.result.hasAtLeastOneLedgerWithFundedDate;
    });
  }

  onClose(): void {
    this.modal.hide();
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

  public onUpdate(): void {
    this.isProcessing = true;
    this.errorText = null;
    this.unsubscribePusherChannel();
    const channelName = StringHelper.generateChannelName(JobNameEnum.UpdateFundedDate, this.projectId, EntityTypeEnum.Projects);
    this.pusherChannel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(BatchActionStatus).map((i: { id: number; name: string }) => i.name),
      this.validationChannelEventHandler.bind(this),
      this.enqueueUpdateFundedDateValidation.bind(this, channelName),
    );
  }

  private enqueueUpdateFundedDateValidation(channelName: string): void {
    const additionalRequest = SearchOptionsHelper
      .getFilterRequest([
        SearchOptionsHelper.getNumberFilter('caseId', FilterTypes.Number, 'equals', this.projectId),
      ]);
    this.clientSummaryGridParams.request.filterModel = this.clientSummaryGridParams.request.filterModel.concat(additionalRequest.filterModel);
    const searchOptions = SearchOptionsHelper.createSearchOptions(this.clientSummaryGridLocalData, this.clientSummaryGridParams);
    searchOptions.startRow = 0;
    searchOptions.endRow = -1;
    this.fundedDate = this.form.value.fundedDate;

    const updateParam: IUpdateFundedDateRequest = {
      searchOptions,
      fundedDate: this.form.value.fundedDate,
    };

    const batchAction: BatchActionDto = {
      entityTypeId: this.projectId ? EntityTypeEnum.Projects : 0,
      entityId: this.projectId || 0,
      batchActionFilters: [{ filter: JSON.stringify(updateParam) }],
      pusherChannelName: channelName,
      batchActionTemplateId: BatchActionTemplate.UpdateFundedDate,
    };

    this.store.dispatch(modalActions.EnqueueUpdateFundedDateValidation({ batchAction }));
  }

  private validationChannelEventHandler(data: any, event: string): void {
    switch (BatchActionStatus[event]) {
      case BatchActionStatus.Complete: {
        this.approve();
        break;
      }
      case BatchActionStatus.Error:
        this.logger.log('[validationChannelEventHandler]', data);
        this.errorText = data.ErrorMessage;
        this.isProcessing = false;
        this.store.dispatch(modalActions.UpdateFundedDateValidationError({ errorMessage: data.ErrorMessage, bsModalRef: this.modal }));
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
        this.store.dispatch(modalActions.UpdateFundedDateApproveSuccess());
        this.dataUpdated.emit();
        this.updatedTimes += 1;
        break;
      }
      case BatchActionStatus.Error:
        this.logger.log('[resultsChannelEventHandler]', data);
        this.errorText = data.ErrorMessage;
        this.isProcessing = false;
        this.store.dispatch(modalActions.UpdateFundedDateApproveError({ errorMessage: data.ErrorMessage, bsModalRef: this.modal }));
        break;
      default:
        break;
    }
  }

  private enqueueBatchUpdateByActionTemplateIdResults(): void {
    this.store.dispatch(modalActions.UpdateFundedDateApprove({ batchActionId: this.batchAction.id }));
  }

  private subscribeToActions(): void {
    this.actionsSubj.pipe(
      ofType(modalActions.EnqueueUpdateFundedDateValidationSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((action: { batchAction: BatchAction; } & TypedAction<string>) => {
      this.batchAction = action.batchAction;
    });
  }

  private unsubscribePusherChannel(): void {
    if (this.pusherChannel) {
      this.pusher.unsubscribeChannel(this.pusherChannel);
    }
  }

  ngOnDestroy(): void {
    this.isShowWarning = false;
    this.unsubscribePusherChannel();
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
