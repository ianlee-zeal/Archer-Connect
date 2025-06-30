import { Component, EventEmitter, OnDestroy } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ActionsSubject, Store } from '@ngrx/store';

import { filter, first, takeUntil } from 'rxjs/operators';
import * as rootSelectors from '@app/state/index';
import { GridId } from '@app/models/enums/grid-id.enum';
import { SearchOptionsHelper, StringHelper } from '@app/helpers';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ofType } from '@ngrx/effects';
import { IGridLocalData } from '@app/state/root.state';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { Observable, Subject } from 'rxjs';
import { EntityTypeEnum, FileImportReviewTabs, JobNameEnum } from '@app/models/enums';
import { PusherService } from '@app/services/pusher.service';
import { LogService } from '@app/services/log-service';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { Channel } from 'pusher-js';
import { BatchAction, BatchActionDto } from '@app/models/batch-action/batch-action';
import { BatchActionTemplate } from '@app/models/enums/batch-action/batch-action-template.enum';
import { BatchActionStatus } from '@app/models/enums/batch-action/batch-action-status.enum';
import { TypedAction } from '@ngrx/store/src/models';
import { ClearSelectedRecordsState } from '@app/state/root.actions';
import * as paymentQueueActions from '../../projects/project-disbursement-payment-queue/state/actions';
import * as paymentQueueSelectors from '../../projects/project-disbursement-payment-queue/state/selectors';
import { ProjectsCommonState } from '../../projects/state/reducer';
import * as globalPaymentQueueActions from '../state/actions';
import * as globalPaymentQueueSelectors from '../state/selectors';
import { CopySpecialPaymentInstructionData } from '@app/models/payment-queue/copy-special-payment-instruction-data';
import { ICopySpecialPaymentInstructionRequest } from '@app/models/closing-statement/copy-special-payment-instruction-request';
import { GridPusherMessage } from '@app/models/documents/grid-pusher-message';
import { FileImportTab } from '@app/models/file-imports';

enum Step {
  SelectedCopyToLedgerEntries = 1,
  CopyFromLedgerEntry = 2,
  Review = 3,
  Results = 4,
}

@Component({
  selector: 'app-copy-special-payment-instructions-modal',
  templateUrl: './copy-special-payment-instructions-modal.component.html',
})
export class CopySpecialPaymentInstructionsModalComponent implements OnDestroy {
  public gridId: GridId;
  public gridParams$: Observable<IServerSideGetRowsParamsExtended>;
  public instructionsUpdated = new EventEmitter();
  public projectId: number;
  public errorMessage: string;
  public pending: boolean;
  public validationResultDocId: number;
  public resultDocId: number;
  public tabsGroup: FileImportTab[];

  public readonly previewButtonAwaitedActions = [
    globalPaymentQueueActions.GetCopySpecialPaymentInstructionsError.type,
    globalPaymentQueueActions.GetCopySpecialPaymentInstructionsSuccess.type,
  ];

  public readonly validateButtonAwaitedActions = [
    globalPaymentQueueActions.CopySpecialPaymentInstructionsValidationCompleted.type,
    globalPaymentQueueActions.CopySpecialPaymentInstructionsValidationError.type,
  ];

  public readonly approveButtonAwaitedActions = [
    globalPaymentQueueActions.CopySpecialPaymentInstructionsApproveCompleted.type,
    globalPaymentQueueActions.CopySpecialPaymentInstructionsApproveError.type,
  ];

  public readonly steps = Step;
  public step: Step = Step.SelectedCopyToLedgerEntries;
  public ledgerEntryId: number;
  public canClickNext: boolean = false;
  public form: UntypedFormGroup = new UntypedFormGroup({ copySPIFromLedgerEntryId: new UntypedFormControl(null, [Validators.required]) });
  private readonly ngUnsubscribe$ = new Subject<void>();

  public readonly selectedPaymentQueueGrid$ = this.store.select(paymentQueueSelectors.selectedPaymentQueueGrid);
  public readonly specialPaymentInstructions$ = this.store.select(globalPaymentQueueSelectors.specialPaymentInstructions);

  private paymentQueueGridParams: IServerSideGetRowsParamsExtended;
  private paymentQueueGridLocalData: IGridLocalData;
  private pusherChannel: Channel;
  public batchAction: BatchAction;
  public paymentInstructions: CopySpecialPaymentInstructionData[];
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


  public onChangeMode(step: Step): void {
    this.step = step;
  }

  public copySPIFromLedgerEntryIdPreviewClick(): void {
    this.pending = true;
    this.errorMessage = "";
    this.store.dispatch(globalPaymentQueueActions.GetCopySpecialPaymentInstructions({ ledgerEntryId: this.form.value.copySPIFromLedgerEntryId, caseId: this.projectId }));
  }

  public onValidateClick(): void {
    this.unsubscribePusherChannel();
    const channelName = StringHelper.generateChannelName(JobNameEnum.CopySpecialPaymentInstructionsValidation);
    this.pusherChannel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(BatchActionStatus).map((i: { id: number; name: string }) => i.name),
      this.validationChannelEventHandler.bind(this),
      this.enqueueValidation.bind(this, channelName),
    );
  }

  private validationChannelEventHandler(data: any, event: string): void {
    switch (BatchActionStatus[event]) {
      case BatchActionStatus.Complete: {
        this.validationResultDocId = data.PreviewDocId;
        this.generatePreviewTabsGroup(data);
        this.store.dispatch(globalPaymentQueueActions.CopySpecialPaymentInstructionsValidationCompleted());
        this.step = Step.Review;
        break;
      }
      case BatchActionStatus.Error:
        this.logger.log('[validationChannelEventHandler]', data);
        this.store.dispatch(globalPaymentQueueActions.CopySpecialPaymentInstructionsValidationError({ errorMessage: data.ErrorMessage, bsModalRef: this.modal }));
        break;
      default:
        break;
    }
  }

  public onApproveClick(): void {
    this.unsubscribePusherChannel();
    this.pusherChannel = this.pusher.subscribeChannel(
      this.batchAction.channelName,
      this.enumToArray.transform(BatchActionStatus).map((i: { id: number; name: string }) => i.name),
      this.resultsChannelEventHandler.bind(this),
      this.copySpecialPaymentInstructionsApprove.bind(this),
    );
  }

  private resultsChannelEventHandler(data: any, event: string): void {
    switch (BatchActionStatus[event]) {
      case BatchActionStatus.Complete: {
        this.generateResultTabsGroup(data);
        this.instructionsUpdated.emit();
        this.isValidationResultLoading = true;
        this.store.dispatch(globalPaymentQueueActions.CopySpecialPaymentInstructionsApproveCompleted());
        this.step = Step.Results;
        break;
      }
      case BatchActionStatus.Error:
        this.logger.log('[resultsChannelEventHandler]', data);
        this.store.dispatch(globalPaymentQueueActions.CopySpecialPaymentInstructionsValidationError({ errorMessage: data.ErrorMessage, bsModalRef: this.modal }));
        break;
      default:
        break;
    }
  }

  private enqueueValidation(channelName: string): void {
    const searchOptions = SearchOptionsHelper.createSearchOptions(this.paymentQueueGridLocalData, this.paymentQueueGridParams);
    searchOptions.startRow = 0;
    searchOptions.endRow = -1;
    this.ledgerEntryId = this.form.value.copySPIFromLedgerEntryId;

    const request: ICopySpecialPaymentInstructionRequest = {
      searchOptions,
      ledgerEntryId: this.ledgerEntryId,
    };

    const batchAction: BatchActionDto = {
      entityTypeId: this.projectId ? EntityTypeEnum.Projects : 0,
      entityId: this.projectId || 0,
      batchActionFilters: [{ filter: JSON.stringify(request) }],
      pusherChannelName: channelName,
      batchActionTemplateId: BatchActionTemplate.CopySpecialPaymentInstructions,
    };

    this.store.dispatch(globalPaymentQueueActions.EnqueueCopySpecialPaymentInstructionsValidation({ batchAction }));
  }

  private unsubscribePusherChannel(): void {
    if (this.pusherChannel) {
      this.pusher.unsubscribeChannel(this.pusherChannel);
    }
  }

  private copySpecialPaymentInstructionsApprove(): void {
    this.store.dispatch(globalPaymentQueueActions.EnqueueCopySpecialPaymentInstructionsApprove({ batchActionId: this.batchAction.id }));
  }

  private subscribeToActions(): void {
    this.actionsSubj.pipe(
      ofType(globalPaymentQueueActions.GetCopySpecialPaymentInstructionsError),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(action => {
      this.pending = false;
      this.errorMessage = action.errorMessage;
    });

    this.actionsSubj.pipe(
      ofType(globalPaymentQueueActions.EnqueueCopySpecialPaymentInstructionsValidationSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((action: { batchAction: BatchAction; } & TypedAction<string>) => {
      this.batchAction = action.batchAction;
    });

    this.specialPaymentInstructions$
      .pipe(
        filter(item => !!item),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(items => {
        this.paymentInstructions = items;
        this.pending = false;
      });
  }

  private generatePreviewTabsGroup(data: GridPusherMessage): void {
    this.batchAction.countTotal = data.Total;
    this.batchAction.countErrored = data.Errored;
    this.batchAction.countWarned = data.Warned;
    this.batchAction.countSuccessful = data.Successful;
    this.tabsGroup = [
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

  private generateResultTabsGroup(data: GridPusherMessage): void {
    this.batchAction.countTotal = data.Total;
    this.batchAction.countErrored = data.Errored;
    this.batchAction.countWarned = data.Warned;
    this.batchAction.countLoaded = data.Enqueued;
    this.tabsGroup = [
      {
        tab: FileImportReviewTabs.AllRecords,
        title: 'All Records',
        count: this.batchAction.countTotal,
      },
      {
        tab: FileImportReviewTabs.Updates,
        title: 'Updates',
        count: this.batchAction.countLoaded,
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
    this.store.dispatch(ClearSelectedRecordsState({ gridId: this.gridId }));
    this.store.dispatch(globalPaymentQueueActions.ResetCopySpecialPaymentInstructions());
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
