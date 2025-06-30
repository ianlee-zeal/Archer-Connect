import { Component, EventEmitter, OnDestroy } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ActionsSubject, Store } from '@ngrx/store';

import { first } from 'rxjs/operators';
import * as rootSelectors from '@app/state/index';
import { GridId } from '@app/models/enums/grid-id.enum';
import { IGridLocalData } from '@app/state/root.state';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { Observable, Subject } from 'rxjs';
import { FileImportReviewTabs } from '@app/models/enums';
import { PusherService } from '@app/services/pusher.service';
import { LogService } from '@app/services/log-service';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { Channel } from 'pusher-js';
import { BatchAction } from '@app/models/batch-action/batch-action';
import { ClearSelectedRecordsState } from '@app/state/root.actions';
import * as paymentQueueActions from '../../projects/project-disbursement-payment-queue/state/actions';
import * as paymentQueueSelectors from '../../projects/project-disbursement-payment-queue/state/selectors';
import { ProjectsCommonState } from '../../projects/state/reducer';
import * as globalPaymentQueueActions from '../state/actions';
import { GridPusherMessage } from '@app/models/documents/grid-pusher-message';
import { FileImportTab } from '@app/models/file-imports';
import * as docActions from '@app/modules/shared/state/upload-bulk-document/actions';

enum Step {
  SelectedEntries = 1,
  DeficiencySummary = 2,
  Results = 3,
}

@Component({
  selector: 'app-authorize-entries-modal',
  templateUrl: './authorize-entries-modal.component.html',
})
export class AuthorizeEntriesModalComponent implements OnDestroy {
  public gridId: GridId;
  public gridParams$: Observable<IServerSideGetRowsParamsExtended>;
  public dataUpdated = new EventEmitter();
  public projectId: number;
  public errorMessage: string;
  public pending: boolean;
  public validationResultDocId: number;
  public resultDocId: number;
  public tabsGroup: FileImportTab[];

  public readonly steps = Step;
  public step: Step = Step.SelectedEntries;
  public canClickNext: boolean = false;
  protected ngUnsubscribe$ = new Subject<void>();

  public readonly selectedPaymentQueueGrid$ = this.store.select(paymentQueueSelectors.selectedPaymentQueueGrid);

  protected paymentQueueGridParams: IServerSideGetRowsParamsExtended;
  protected paymentQueueGridLocalData: IGridLocalData;
  protected pusherChannel: Channel;
  public batchAction: BatchAction;

  constructor(
    public modal: BsModalRef,
    public store: Store<ProjectsCommonState>,
    protected actionsSubj: ActionsSubject,
    public pusher: PusherService,
    protected enumToArray: EnumToArrayPipe,
    protected logger: LogService,
  ) {
  }

  public ngOnInit(): void {
    this.subscribeToPaymentQueueGridParams();
    this.subscribeToPaymentQueueGridLocalData();
    this.store.dispatch(paymentQueueActions.GetActiveLienPaymentStages());
  }

  public onChangeMode(step: Step): void {
    this.step = step;
  }

  public onValidationResultsClick(): void {
    this.store.dispatch(docActions.DownloadDocument({ id: this.validationResultDocId }));
  }

  protected unsubscribePusherChannel(): void {
    if (this.pusherChannel) {
      this.pusher.unsubscribeChannel(this.pusherChannel);
    }
  }

  protected generateResultTabsGroup(data: GridPusherMessage): void {
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
        tab: FileImportReviewTabs.Updates,
        title: 'Updates',
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

  protected subscribeToPaymentQueueGridParams(): void {
    this.gridParams$.pipe(first())
      .subscribe((params: any) => {
        this.paymentQueueGridParams = params;
      });
  }

  protected subscribeToPaymentQueueGridLocalData(): void {
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
