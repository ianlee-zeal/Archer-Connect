import { Component, OnDestroy, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { first, takeUntil } from 'rxjs/operators';
import * as rootSelectors from '@app/state/index';
import { GridId } from '@app/models/enums/grid-id.enum';
import { GridOptions } from 'ag-grid-community';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { IGridLocalData } from '@app/state/root.state';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { Observable } from 'rxjs';
import { LogService } from '@app/services/log-service';
import * as rootActions from '@app/state/root.actions';
import { SearchOptionsHelper, CurrencyHelper } from '@app/helpers';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import * as paymentQueueActions from '@app/modules/projects/project-disbursement-payment-queue/state/actions';
import { ProjectsCommonState } from '@app/modules/projects/state/reducer';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { BankruptcyStatusRendererComponent } from '@app/modules/projects/project-disbursement-payment-queue/renderers/bk-status-renderer/bk-status-renderer.component';
import { PaymentQueueRendererComponent } from '@app/modules/projects/project-disbursement-payment-queue/renderers/payment-queue-buttons-renderer';
import { AccountRendererComponent } from '@app/modules/projects/project-disbursement-payment-queue/renderers/account-renderer/account-renderer-component';
import { FilterModel } from '@app/models/advanced-search/filter-model';
import { lienPaymentStages, lienStatuses, bankruptcyStages } from '@app/modules/projects/project-disbursement-payment-queue/state/selectors';

@Component({
  selector: 'app-unauthorized-ledgers-review-grid',
  templateUrl: './unauthorized-ledgers-review-grid.component.html'
})
export class UnauthorizedLedgersReviewGridComponent extends ListView implements OnDestroy, OnChanges {
  public readonly gridId: GridId = GridId.ReviewUnAuthorizeLedgerEntries;
  private lienPaymentStages: SelectOption[] = [];
  private bankruptcyStages: SelectOption[] = [];
  private lienStatuses: SelectOption[] = [];
  @Input() public parentGridId: GridId;
  @Input() public paymentQueueGridParams: IServerSideGetRowsParamsExtended;
  @Input() public projectId: number;
  @Input() public batchActionId: number;

  public gridParams$: Observable<IServerSideGetRowsParamsExtended>;
  private paymentQueueGridLocalData: IGridLocalData;
  public gridParams: IServerSideGetRowsParamsExtended

  private readonly lienPaymentStages$ = this.store.select(lienPaymentStages);
  private readonly bankruptcyStages$ = this.store.select(bankruptcyStages);
  public lienStatuses$ = this.store.select(lienStatuses);

  constructor(
    public store: Store<ProjectsCommonState>,
    public router: Router,
    public elRef: ElementRef<any>,
    public route: ActivatedRoute,
    protected elementRef: ElementRef,
    protected logger: LogService
  ) {
    super(router, elRef);
  }

  private readonly MAX_ROWS_NUMBER = 5;

  get isMaxRowsNumber(): boolean {
    return this.gridApi?.getDisplayedRowCount() > this.MAX_ROWS_NUMBER;
  }

  get rowHeight(): string {
    const headerHeight = 50;
    return `${this.MAX_ROWS_NUMBER * AGGridHelper.defaultGridOptions.rowHeight + headerHeight}px`;
  }

  public ngOnInit(): void {
    this.subscribeToPaymentQueueGridLocalData();
    this.subscribeToDropdownsOptions();
    this.store.dispatch(paymentQueueActions.GetLienPaymentStages());
    this.store.dispatch(paymentQueueActions.GetLienStatuses());
    this.store.dispatch(paymentQueueActions.GetBankruptcyStages());
  }

  ngOnChanges(changes: SimpleChanges): void {
    const batches = changes['batchActionId'];
    if (this.gridParams && ((batches && batches.currentValue > 0) || this.batchActionId > 0)) {
      this.batchActionId = (batches && batches.currentValue) ?? this.batchActionId;
      this.fetchGridData(this.gridParams, this.batchActionId );
    }
  }

  protected fetchData(gridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = gridParams
    if (this.batchActionId && this.batchActionId > 0) {
      this.fetchGridData(gridParams, this.batchActionId);
    }
  }

  public fetchGridData(gridParams: IServerSideGetRowsParamsExtended, batchActionId: number): void {
      const searchOpts = SearchOptionsHelper.createSearchOptions(this.paymentQueueGridLocalData, this.paymentQueueGridParams);
      searchOpts.startRow = gridParams.request.startRow;
      searchOpts.endRow = gridParams.request.endRow;
      searchOpts.sortModel = gridParams.request.sortModel;

      searchOpts.filterModel = [
        ...searchOpts.filterModel,
        new FilterModel({ filter: 2, type: 'equals', key: 'unAuthorizedLedgerEntriesReviewFilter', filterType: FilterTypes.Number }),
        new FilterModel({ filter: batchActionId, type: 'equals', key: 'batchActionId', filterType: FilterTypes.Number }),
      ];

      this.store.dispatch(paymentQueueActions.GetSelectedPaymentQueueUnauthorizedLedgersGrid({ searchOpts, agGridParams: gridParams, projectId: this.projectId }));
  }

  private subscribeToPaymentQueueGridLocalData(): void {
    this.store.select(rootSelectors.gridLocalDataByGridId({ gridId: this.parentGridId }))
      .pipe(first())
      .subscribe((data: IGridLocalData) => {
        this.paymentQueueGridLocalData = data;
      });
  }

  private subscribeToDropdownsOptions(): void {
    this.lienPaymentStages$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((items: SelectOption[]) => {
      this.lienPaymentStages = items;
    });

    this.lienStatuses$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((items: SelectOption[]) => {
      this.lienStatuses = items;
    });

    this.bankruptcyStages$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((items: SelectOption[]) => {
      this.bankruptcyStages = items;
    });
  }

  public gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [  {
      headerName: 'Description',
      field: 'description',
      minWidth: 520,
      sortable: true,
      wrapText: true,
      ...AGGridHelper.fixedColumnDefaultParams,
      valueGetter: params => {
        const statusId = params.data.statusId;
        const enableIndividualAuthorize = params.data.enableIndividualAuthorize;
        return AGGridHelper.GetDescription(statusId, enableIndividualAuthorize);
      }
    },
      {
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
      },
      {
        headerName: 'First Name',
        field: 'claimantFirstName',
        sortable: true,
      },
      {
        headerName: 'Last Name',
        field: 'claimantLastName',
        sortable: true,
      },
      {
        headerName: 'Account Group',
        field: 'accountGroupNameWithNumber',
        colId: 'accountGroupName',
        sortable: true,
        width: 190,
        minWidth: 190,
      },
      {
        headerName: 'Account',
        field: 'accountName',
        sortable: true,
        width: 250,
        minWidth: 250,
        cellRenderer: 'AccountRenderer',
      },
      {
        headerName: 'Primary Firm',
        field: 'clientPrimaryFirmName',
        width: 190,
        minWidth: 190,
        sortable: true,
      },
      {
        headerName: 'Payee',
        field: 'payeeName',
        width: 190,
        minWidth: 190,
        sortable: true,
        cellRenderer: 'PayeeRenderer',
      },
      {
        headerName: 'AssignedOrg',
        field: 'assignedOrgName',
        width: 190,
        minWidth: 190,
        sortable: true,
      },
      {
        headerName: 'AssignedOrg Relationship',
        field: 'assignedOrgRelation',
        width: 190,
        minWidth: 190,
        sortable: true,
      },
      {
        headerName: 'Status',
        field: 'status',
        colId: 'statusName',
        width: 190,
        minWidth: 190,
        sortable: true,
      },
      {
        headerName: 'Amount',
        sortable: true,
        field: 'amount',
        cellRenderer: (data: any): string => CurrencyHelper.toUsdFormat(data),
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Disbursement Group',
        field: 'disbursementGroupName',
        sortable: true,
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Ledger Stage',
        field: 'stage.name',
        width: 240,
        minWidth: 240,
        colId: 'stage.id',
        sortable: true,
      },
      {
        headerName: 'BK',
        field: 'bankruptcyStatusId',
        sortable: true,
        cellRenderer: 'bkStatusRenderer',
        ...AGGridHelper.tagColumnDefaultParams,
        width: 150,
        minWidth: 150,
      },
      {
        headerName: 'BK Trustee Amount',
        field: 'amountToTrustee',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: (data: any): string => CurrencyHelper.toUsdFormat(data, true),
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'BK Attorney Amount',
        field: 'amountToAttorney',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: (data: any): string => CurrencyHelper.toUsdFormat(data, true),
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'BK Claimant Amount',
        field: 'amountToClaimant',
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        cellRenderer: (data: any): string => CurrencyHelper.toUsdFormat(data, true),
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Lien ID',
        field: 'lienId',
        sortable: true,
        width: 240,
        minWidth: 240,
      },
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    components: {
      bkStatusRenderer: BankruptcyStatusRendererComponent,
      PayeeRenderer: PaymentQueueRendererComponent,
      AccountRenderer: AccountRendererComponent,
    },
  };

  public ngOnDestroy(): void {
    this.store.dispatch(rootActions.ClearGridLocalData({ gridId: this.gridId }));
    super.clearFilters();
    super.ngOnDestroy();
  }
}
