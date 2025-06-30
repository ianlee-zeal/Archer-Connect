import { Component, OnDestroy, ElementRef, EventEmitter} from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ActionsSubject, Store } from '@ngrx/store';
import { TypedAction } from '@ngrx/store/src/models';
import { first, takeUntil } from 'rxjs/operators';
import * as rootSelectors from '@app/state/index';
import { GridId } from '@app/models/enums/grid-id.enum';
import { SearchOptionsHelper, StringHelper } from '@app/helpers';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ofType } from '@ngrx/effects';
import { IGridLocalData } from '@app/state/root.state';
import { JiraMarkupHelper } from '@app/modules/communication-hub/jira-markup.helper';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { Observable } from 'rxjs';
import { EntityTypeEnum, JobNameEnum } from '@app/models/enums';
import { PusherService } from '@app/services/pusher.service';
import { LogService } from '@app/services/log-service';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { Channel } from 'pusher-js';
import { BatchAction, BatchActionDto } from '@app/models/batch-action/batch-action';
import { BatchActionTemplate } from '@app/models/enums/batch-action/batch-action-template.enum';
import { ClearSelectedRecordsState } from '@app/state/root.actions';
import * as paymentQueueActions from '@app/modules/projects/project-disbursement-payment-queue/state/actions';
import * as paymentQueueSelectors from '@app/modules/projects/project-disbursement-payment-queue/state/selectors';
import { ProjectsCommonState } from '@app/modules/projects/state/reducer';
import { BatchActionStatus } from '@app/models/enums/batch-action/batch-action-status.enum';
import { QuillModules } from 'ngx-quill';
import { PaymentQueue } from '@app/models/payment-queue';
import { ISearchOptions } from '@app/models/search-options';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';

enum Step {
  SelectedLegers = 1,
  AuthorizationNote = 2,
  Review = 3,
  Results = 4,
}

@Component({
  selector: 'app-authorize-ledger-entries-modal',
  templateUrl: './authorize-ledger-entries-modal.component.html'
})

export class AuthorizeLedgerEntriesModalComponent extends ListView implements OnDestroy {

  public notes: string;
  public readonly gridId: GridId = GridId.PaymentQueue;
  public gridParams$: Observable<IServerSideGetRowsParamsExtended>;
  public projectId: number;
  public errorMessage: string;
  private paymentQueueGridParams: IServerSideGetRowsParamsExtended;
  private selectedGridLocalData: IGridLocalData;
  private pusherChannel: Channel;
  private channelName: string;
  public batchAction: BatchAction;
  public readonly steps = Step;
  public step: Step = Step.SelectedLegers;
  public batchActionId: number = 0;
  jiraMarkupHelper = new JiraMarkupHelper();
  editorModules: QuillModules = JiraMarkupHelper.editorModules;
  public labelText: string = 'Ledger Entries';
  public isDisabled: boolean = true;
  public searchOptions: ISearchOptions;
  public statusUpdated = new EventEmitter();

  constructor(
    public modal: BsModalRef,
    private actionsSubj: ActionsSubject,
    public store: Store<ProjectsCommonState>,
    public pusher: PusherService,
    public router: Router,
    public elRef: ElementRef<any>,
    private enumToArray: EnumToArrayPipe,
    private logger: LogService

  ) {
    super(router, elRef);
  }

  public form = new UntypedFormGroup({ note: new UntypedFormControl('', [Validators.required, Validators.maxLength(500)]) });
  get isValid(): boolean {
    return (this.form && this.form.valid && this.jiraMarkupHelper.parseHtmlToMarkdown(this.form.value.note).replace(' \n', '').trim().length > 0);
  }

  public readonly selectedPaymentQueueGrid$ = this.store.select(paymentQueueSelectors.selectedPaymentQueueGrid);
  public readonly selectedAuthorizedPaymentQueueGrid$ = this.store.select(paymentQueueSelectors.selectedAuthorizedPaymentQueueGrid);

  public ngOnInit(): void {
    this.subscribeToPaymentQueueGridParams();
    this.subscribeToPaymentQueueGridLocalData();
    this.subscribeToActions();
  }

  public onChangeMode(step: Step): void {
    this.step = step;
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
        this.selectedGridLocalData = data;
      });
  }

  protected subscribeToActions(): void {
    this.actionsSubj.pipe(
      ofType(paymentQueueActions.ValidateAuthorizeLedgerEntriesRequestError),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(action => {
      this.errorMessage = action.errorMessage;
    });

    this.actionsSubj.pipe(
      ofType(paymentQueueActions.ValidateAuthorizeLedgerEntriesRequestSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((action: { batchAction: BatchAction; } & TypedAction<string>) => {
      this.batchAction = action.batchAction;
    });

    this.actionsSubj.pipe(
      ofType(paymentQueueActions.GetSelectedPaymentQueueAuthorizedLedgersGridComplete),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((action: { paymentQueueGrid: PaymentQueue[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number} & TypedAction<string>) => {
      this.isDisabled=!(action.totalRecords && action.totalRecords > 0);
    });
  }

  protected getChannelName(): string {
    return StringHelper.generateChannelName(
      JobNameEnum.AuthorizeLedgerEntries,
      this.projectId,
      EntityTypeEnum.ClaimSettlementLedgerEntries,
    );
  }

  protected fetchData(gridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = gridParams;
  }

  public onSubmit(): void {
    this.unsubscribePusherChannel();
    this.pusherChannel = this.pusher.subscribeChannel(
      this.batchAction.channelName,
      this.enumToArray.transform(BatchActionStatus).map((i: { id: number; name: string }) => i.name),
      this.resultsChannelEventHandler.bind(this),
      this.authorizeApprove.bind(this),
    );
  }

  protected resultsChannelEventHandler(data: any, event: string): void {
    switch (BatchActionStatus[event]) {
      case BatchActionStatus.Complete: {
        this.store.dispatch(paymentQueueActions.LoadAuthorizeLedgerEntriesRequestCompleted());
        this.batchActionId = data.RowNo;
        this.step = Step.Results;
        this.statusUpdated.emit();
        break;
      }
      case BatchActionStatus.Error:
        this.logger.log('[resultsChannelEventHandler]', data);
        this.store.dispatch(paymentQueueActions.LoadAuthorizeLedgerEntriesRequestError({ errorMessage: data.ErrorMessage, bsModalRef: this.modal }));
        break;
      default:
        break;
    }
  }

  protected authorizeApprove(): void {
    this.store.dispatch(paymentQueueActions.LoadAuthorizeLedgerEntriesRequest({ batchActionId: this.batchActionId }));
  }

  public readonly loadButtonAwaitedActions = [
    paymentQueueActions.LoadAuthorizeLedgerEntriesRequestCompleted.type,
    paymentQueueActions.LoadAuthorizeLedgerEntriesRequestError.type,
  ];

  public onValidate(): void {
    this.unsubscribePusherChannel();
    this.channelName = this.getChannelName();
    if (this.step == Step.AuthorizationNote) {
      this.notes = this.jiraMarkupHelper.parseHtmlToMarkdown(this.form.value.note).replace(' \n', '').trim();
    }
    this.pusherChannel = this.pusher.subscribeChannel(
      this.channelName,
      this.enumToArray.transform(BatchActionStatus).map((i: { id: number; name: string }) => i.name),
      this.validationChannelEventHandler.bind(this),
      this.validateAuthorizeLedgerEntries.bind(this,this.notes)
    );
  }

  public readonly validateButtonAwaitedActions = [
    paymentQueueActions.ValidateAuthorizeLedgerEntriesCompleted.type,
    paymentQueueActions.ValidateAuthorizeLedgerEntriesRequestError.type,
  ];

  protected validationChannelEventHandler(data: any, event: string): void {
    switch (BatchActionStatus[event]) {
      case BatchActionStatus.Complete: {
        this.store.dispatch(paymentQueueActions.ValidateAuthorizeLedgerEntriesCompleted());
        this.batchActionId  = data.RowNo;
        this.step = this.step == Step.AuthorizationNote ? Step.Review : Step.Results;
        break;
      }
      case BatchActionStatus.Error:
        this.logger.log('[validationChannelEventHandler]', data);
        this.store.dispatch(paymentQueueActions.ValidateAuthorizeLedgerEntriesRequestError({ errorMessage: data.ErrorMessage, bsModalRef: this.modal }));
        break;
      default:
        break;
    }
  }

  protected validateAuthorizeLedgerEntries(authorizeNote: string): void {
    const searchOptions = SearchOptionsHelper.createSearchOptions(this.selectedGridLocalData, this.paymentQueueGridParams);
    searchOptions.startRow = 0;
    searchOptions.endRow = -1;
    const batchAction: BatchActionDto = {
      entityTypeId: this.projectId ? EntityTypeEnum.Projects : 0,
      entityId: this.projectId || 0,
      batchActionFilters: [{ filter: JSON.stringify({ searchOptions: searchOptions }) }],
      pusherChannelName: this.channelName,
      batchActionTemplateId: BatchActionTemplate.AuthorizeLedgerEntries,
      config: JSON.stringify({ note: authorizeNote })
    };

    this.searchOptions = searchOptions;
    this.store.dispatch(paymentQueueActions.ValidateAuthorizeLedgerEntriesRequest({ batchAction }));
  }

  private unsubscribePusherChannel(): void {
    if (this.pusherChannel) {
      this.pusher.unsubscribeChannel(this.pusherChannel);
    }
  }

  onClose(): void {
    this.clearFilters();
    this.refreshGrid();
    this.modal.hide();
  }

  private refreshGrid(): void {
    if (this.gridApi) {
      this.gridApi.refreshServerSide({ purge: true });
    }
  }

  public clearFilters(): void {
    super.clearFilters();
  }

  public gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [{
      headerName: 'Payee Org Id',
      field: 'payeeOrgId',
      hide: true,
      suppressColumnsToolPanel: true,
    },
      {
        headerName: 'Ledger Entry ID',
        field: 'ledgerEntryId',
        colId: 'id',
        width: 100,
        sortable: true,
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'ARCHER ID',
        field: 'archerId',
        width: 100,
        maxWidth: 100,
        sortable: true,
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Attorney Ref ID',
        field: 'attorneyReferenceId',
        width: 140,
        sortable: true,
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Client ID',
        field: 'clientId',
        width: 80,
        maxWidth: 80,
        sortable: true,
        ...AGGridHelper.fixedColumnDefaultParams,
      }
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    }
  };

  public ngOnDestroy(): void {
    this.store.dispatch(ClearSelectedRecordsState({ gridId: this.gridId }));
    super.clearFilters();
    this.refreshGrid();
    super.ngOnDestroy();
  }
}
