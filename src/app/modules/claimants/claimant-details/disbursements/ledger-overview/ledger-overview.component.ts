import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { Subject } from 'rxjs';

import { Store } from '@ngrx/store';
import { CellClassParams, GridApi, GridOptions } from 'ag-grid-community';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { CurrencyHelper, PercentageHelper } from '@app/helpers';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ModalService } from '@app/services';
import { filter, takeUntil } from 'rxjs/operators';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { AppState } from '@app/state';
import { LedgerOverview } from '@app/models/ledger-overview';
import { LedgerOverviewTotal } from '@app/models/ledger-overview-total';
import { ClaimSettlementLedgerEntryStatus } from '@app/models/enums';
import { EnumToArrayPipe, ExtendedCurrencyPipe, SplitCamelCasePipe } from '@app/modules/shared/_pipes';

import * as selectors from '../../state/selectors';
import * as actions from '../../state/actions';

@Component({
  selector: 'app-ledger-overview',
  templateUrl: './ledger-overview.component.html',
})
export class LedgerOverviewComponent extends ListView {
  private currentClaimantId: number;
  public readonly currentClaimant$ = this.store.select(selectors.item);
  public readonly ledgerOverviewGrid$ = this.store.select(selectors.ledgerOverviewGrid);
  public readonly ledgerOverviewTotal$ = this.store.select(selectors.ledgerOverviewTotal);

  protected ngUnsubscribe$ = new Subject<void>();

  private readonly columnsWithAggregation = ['percentage', 'expense', 'income', 'credit', 'amount'];
  private pinnedRow = {};

  public readonly gridId: GridId = GridId.LedgerOverview;
  public readonly gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'Disbursement Group',
        headerTooltip: 'Disbursement Group',
        field: 'disbursementGroup.name',
        minWidth: 220,
        resizable: true,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Account Group No',
        headerTooltip: 'Account Group No',
        field: 'accountGroupNo',
        width: 130,
        minWidth: 130,
        maxWidth: 130,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Account No',
        headerTooltip: 'Account No',
        field: 'accountNo',
        width: 100,
        minWidth: 100,
        maxWidth: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Account Name',
        headerTooltip: 'Account Name',
        field: 'accountName',
        minWidth: 220,
        resizable: true,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Description',
        headerTooltip: 'Description',
        field: 'description',
        minWidth: 220,
        resizable: true,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Percentage',
        headerTooltip: 'Percentage',
        field: 'percentage',
        maxWidth: 150,
        sortable: true,
        ...AGGridHelper.getPercentageFilter(),
        ...AGGridHelper.amountColumnDefaultParams,
        cellRendererSelector: params => {
          if (params.node.rowPinned) {
            return {
              component: () => `<strong>${PercentageHelper.toFractionPercentage(params.data.percentage * 100, 8)}</strong>`,
            };
          }
          return {
            component: data => PercentageHelper.toFractionPercentage(data.value * 100, 8),
          };
        },
      },
      {
        headerName: 'Disbursement',
        headerTooltip: 'Disbursement',
        field: 'income',
        sortable: true,
        ...AGGridHelper.amountColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        cellRendererSelector: params => {
          if (params.node.rowPinned) {
            return {
              component: () => `<strong>${this.currencyPipe.transform(params.data.income)}</strong>`,
            };
          }
          return {
            component: data => this.currencyPipe.transform(data.value),
          };
        },
      },
      {
        headerName: 'Credit',
        headerTooltip: 'Credit',
        field: 'credit',
        sortable: true,
        ...AGGridHelper.amountColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        cellRendererSelector: params => {
          if (params.node.rowPinned) {
            return {
              component: () => `<strong>${this.currencyPipe.transform(params.data.credit)}</strong>`,
            };
          }
          return {
            component: data => this.currencyPipe.transform(data.value),
          };
        },
      },
      {
        headerName: 'Expense',
        headerTooltip: 'Expense',
        field: 'expense',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true, isNegativeNumber: true }),
        ...AGGridHelper.amountColumnDefaultParams,
        cellClass: (params: CellClassParams) => {
          if ((params.data as LedgerOverview).expense < 0) {
            return 'ag-cell-red';
          }
          return null;
        },
        cellStyle: { display: 'flex', 'justify-content': 'flex-end' },
        cellRendererSelector: params => {
          if (params.node.rowPinned) {
            return {
              component: () => (params.data.expense < 0 ? `<strong>(${this.currencyPipe.transform(Math.abs(params.data.expense))})</strong>` : `<strong>${this.currencyPipe.transform(params.data.expense)}</strong>`),
            };
          }
          return {
            component: data => (data.value < 0 ? `(${this.currencyPipe.transform(Math.abs(data.value))})` : `${this.currencyPipe.transform(data.value)}`),
          };
        },
      },
      {
        headerName: 'Totals',
        headerTooltip: 'Totals',
        field: 'amount',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true, isNegativeNumber: true }),
        ...AGGridHelper.amountColumnDefaultParams,
        cellClass: (params: CellClassParams) => {
          if ((params.data as LedgerOverview).amount < 0) {
            return 'ag-cell-red';
          }
          return null;
        },
        cellStyle: { display: 'flex', 'justify-content': 'flex-end' },
        cellRendererSelector: params => {
          if (params.node.rowPinned) {
            return {
              component: () => (params.data.amount < 0 ? `<strong>(${this.currencyPipe.transform(Math.abs(params.data.amount))})</strong>` : `<strong>${this.currencyPipe.transform(params.data.amount)}</strong>`),
            };
          }
          return {
            component: data => (data.value < 0 ? `(${this.currencyPipe.transform(Math.abs(data.value))})` : `${this.currencyPipe.transform(data.value)}`),
          };
        },
      },
      {
        headerName: 'Status',
        headerTooltip: 'Status',
        field: 'status',
        minWidth: 220,
        width: 220,
        resizable: true,
        sortable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getTruthyFalsyDropdownColumnFilter(
          {
            options: this.enumToArrayPipe.transform(ClaimSettlementLedgerEntryStatus).map(i => {
              const name = i.id === ClaimSettlementLedgerEntryStatus.NonPayable ? 'Non-Payable' : this.splitCamelCase.transform(i.name);
              return {
                id: name,
                name,
              };
            }),
          },
        ),
      },
      {
        headerName: 'Is Holdback',
        headerTooltip: 'Is Holdback',
        field: 'isHoldback',
        sortable: true,
        cellRenderer: data => {
          if (data.value === null) {
            return '';
          }
          return data.value ? 'Yes' : 'No';
        },
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        width: 110,
        minWidth: 110,
        maxWidth: 110,
      },
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    pagination: false,
  };

  constructor(
    private readonly store: Store<AppState>,
    protected readonly router: Router,
    public readonly modalService: ModalService,
    protected readonly elementRef: ElementRef,
    private readonly enumToArrayPipe: EnumToArrayPipe,
    private currencyPipe: ExtendedCurrencyPipe,
    private splitCamelCase: SplitCamelCasePipe,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    this.store.dispatch(actions.UpdateClaimantsActionBar({ actionBar: { clearFilter: super.clearFilterAction() } }));

    this.currentClaimant$
      .pipe(
        filter(item => !!item),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(claimant => {
        this.currentClaimantId = claimant.id;
      });

    this.ledgerOverviewTotal$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
        filter(item => !!item),
      )
      .subscribe(data => {
        const pinnedBottomData = this.generatePinnedBottomData(data);

        if (this.gridApi) {
          this.gridApi.setGridOption('pinnedBottomRowData', [pinnedBottomData]);
        }
      });
  }

  onGridReady(gridApi: GridApi) {
    super.gridReady(gridApi);

    if (this.gridApi) {
      this.gridApi.getAllGridColumns().forEach(item => {
        this.pinnedRow[item.getColId()] = null;
      });
    }
  }

  generatePinnedBottomData(data: LedgerOverviewTotal) {
    return this.calculatePinnedBottomData(data);
  }

  calculatePinnedBottomData(data: LedgerOverviewTotal) {
    this.columnsWithAggregation.forEach(element => {
      // eslint-disable-next-line no-param-reassign
      if (!Number.isNaN(Number(data[element]))) this.pinnedRow[element] = CurrencyHelper.round(data[element]);
    });

    return this.pinnedRow;
  }

  public fetchData(params: IServerSideGetRowsParamsExtended): void {
    this.gridParams = params;
    this.store.dispatch(actions.GetLedgerOverviewList({ clientId: this.currentClaimantId, agGridParams: this.gridParams }));
    this.store.dispatch(actions.GetLedgerOverviewTotal({ clientId: this.currentClaimantId, agGridParams: this.gridParams }));
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
