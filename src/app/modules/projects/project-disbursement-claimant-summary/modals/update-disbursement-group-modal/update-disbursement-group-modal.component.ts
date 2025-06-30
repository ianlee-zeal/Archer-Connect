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
import * as ProjectActions from '@app/modules/projects/state/actions';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import * as claimantSummarySelectors from '@app/modules/projects/project-disbursement-claimant-summary/state/selectors';
import { ofType } from '@ngrx/effects';
import isString from 'lodash-es/isString';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { LogService } from '@app/services/log-service';
import { PusherService } from '@app/services/pusher.service';
import { BatchActionDto } from '@app/models/batch-action/batch-action';
import { Channel } from 'pusher-js';
import { BatchActionStatus } from '@app/models/enums/batch-action/batch-action-status.enum';
import { StringHelper, SearchOptionsHelper } from '@app/helpers';
import { BatchActionTemplate } from '@app/models/enums/batch-action/batch-action-template.enum';
import * as docActions from '@app/modules/shared/state/upload-bulk-document/actions';
import { IDisbursementGroupUpdateRequestDto } from '@app/models/closing-statement/disbursement-group-update-request';
import { DisbursementGroup } from '@app/models/disbursement-group';

export enum UpdateDisbursementGroupStage {
  ClaimantConfig = 1,
  DisbursementGroupsConfig = 2,
  Result = 3,
}

@Component({
  selector: 'app-update-disbursement-group-modal',
  templateUrl: './update-disbursement-group-modal.component.html',
  styleUrls: ['./update-disbursement-group-modal.component.scss'],
})
export class UpdateDisbursementGroupModalComponent implements OnDestroy {
  private ngUnsubscribe$ = new Subject<void>();
  public stagesUpdated = new EventEmitter();

  public projectId: number;
  public selectedDisbursementGroup: DisbursementGroup;
  public errorText: string;
  public message: string;
  public validationResultDocId: number;
  public erroredItemsCount: number;
  public steps = UpdateDisbursementGroupStage;
  public step = UpdateDisbursementGroupStage.ClaimantConfig;
  private clientSummaryGridParams: IServerSideGetRowsParamsExtended;
  private clientSummaryGridLocalData: IGridLocalData;
  private pusherChannel: Channel;

  get isClaimantConfigStage(): boolean {
    return this.step === this.steps.ClaimantConfig;
  }

  get isDisbursementGroupsConfigStage(): boolean {
    return this.step === this.steps.DisbursementGroupsConfig;
  }

  public readonly submitButtonAwaitedActions = [
    ProjectActions.BatchUpdateDisbursementGroupValidationCompleted.type,
    ProjectActions.BatchUpdateDisbursementGroupError.type,
  ];

  public readonly validationResultsButtonAwaitedActions = [
    docActions.DownloadDocumentComplete.type,
    docActions.DownloadDocumentError.type,
  ];

  constructor(
    private readonly modal: BsModalRef,
    public store: Store<ProjectsCommonState>,
    private actionsSubj: ActionsSubject,
    public pusher: PusherService,
    private enumToArray: EnumToArrayPipe,
    private logger: LogService,
  ) { }

  ngOnInit(): void {
    this.subscribeToClientSummaryGridLocalData();
    this.subscribeToClientSummaryGridParams();

    this.actionsSubj.pipe(
      ofType(ProjectActions.Error),
      filter(action => !isString(action.error)),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((action: any) => {
      this.errorText = action.error.error;
    });
  }

  onClose(): void {
    this.modal.hide();
  }

  public onChangeMode(step: UpdateDisbursementGroupStage): void {
    this.errorText = null;
    this.step = step;
  }

  public onSelectDisbursementGroup(selectedRow: DisbursementGroup) {
    this.selectedDisbursementGroup = selectedRow;
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

  public onSubmit(): void {
    this.errorText = null;
    this.unsubscribePusherChannel();
    const channelName = StringHelper.generateChannelName(JobNameEnum.BatchUpdateDisbursementGroupValidation, this.projectId, EntityTypeEnum.Projects);
    this.pusherChannel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(BatchActionStatus).map(i => i.name),
      this.validationChannelEventHandler.bind(this),
      this.enqueueBatchUpdateDisbursementGroupValidation.bind(this, channelName),
    );
  }

  private enqueueBatchUpdateDisbursementGroupValidation(channelName: string): void {
    const searchOptions = SearchOptionsHelper.createSearchOptions(this.clientSummaryGridLocalData, this.clientSummaryGridParams);
    searchOptions.startRow = 0;
    searchOptions.endRow = -1;
    searchOptions.filterModel = [
      ...searchOptions.filterModel,
    ];

    const updateDisbursementGroupParam: IDisbursementGroupUpdateRequestDto = {
      caseId: this.projectId,
      searchOptions,
      disbursementGroupId: this.selectedDisbursementGroup.id,
    };

    const batchAction: BatchActionDto = {
      entityId: this.projectId,
      entityTypeId: EntityTypeEnum.Projects,
      batchActionFilters: [{ filter: JSON.stringify(updateDisbursementGroupParam) }],
      pusherChannelName: channelName,
      batchActionTemplateId: BatchActionTemplate.UpdateDisbursementGroup,
    };

    this.store.dispatch(ProjectActions.EnqueueBatchUpdateDisbursementGroupValidation({ batchAction }));
  }

  private validationChannelEventHandler(data: any, event: string): void {
    switch (BatchActionStatus[event]) {
      case BatchActionStatus.Complete: {
        this.validationResultDocId = data.PreviewDocId;
        this.erroredItemsCount = data.Errored;
        this.message = `${data.Successful} of ${data.Successful + data.Errored} claimants are successfully moved to the '${this.selectedDisbursementGroup.name}'.${data.Errored ? ' See the validation file with info' : ''}`;
        this.store.dispatch(ProjectActions.BatchUpdateDisbursementGroupValidationCompleted());
        this.stagesUpdated.emit();
        break;
      }
      case BatchActionStatus.Error:
        this.logger.log('[validationChannelEventHandler]', data);
        this.errorText = data.ErrorMessage;
        this.store.dispatch(ProjectActions.BatchUpdateDisbursementGroupError());
        break;
      default:
        break;
    }
  }

  public onValidationResultsClick(): void {
    this.store.dispatch(docActions.DownloadDocument({ id: this.validationResultDocId }));
  }

  private unsubscribePusherChannel(): void {
    if (this.pusherChannel) {
      this.pusher.unsubscribeChannel(this.pusherChannel);
    }
  }

  ngOnDestroy() {
    this.unsubscribePusherChannel();
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
