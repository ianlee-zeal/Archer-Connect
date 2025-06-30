import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { GridApi, GridOptions } from 'ag-grid-community';
import { Store } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { AppState } from '@app/modules/projects/state';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { first } from 'rxjs/operators';
import { CurrencyHelper } from '@app/helpers';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import { SearchInvoiceItems } from '@app/modules/projects/state/actions';
import * as actions from '../../state/actions';
import * as selectors from '../../state/selectors';
import { FilterModel } from '@app/models/advanced-search/filter-model';

@Component({
  selector: 'app-claimant-invoice-items-grid',
  templateUrl: './claimant-invoice-items-grid.component.html',
})
export class ClaimantInvoiceItemsGridComponent extends ListView {
  public readonly gridId = GridId.InvoiceItems;
  public currentProjectId: number;
  public currentClaimantId: number;
  readonly item$ = this.store.select(selectors.item);

  private actionBarActionHandlers: ActionHandlersMap = { clearFilter: this.clearFilterAction() };

  public gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'ID',
        field: 'id',
        width: 50,
        maxWidth: 110,
        sortable: true,
        sort: 'desc',
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter({
          onlyNumbers: true,
          isAutofocused: true,
        }),
      },
      {
        headerName: 'Fee Scope',
        field: 'billingRule.feeScope.name',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Related Entity ID',
        field: 'relatedEntityTypeId',
        width: 120,
        minWidth: 120,
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
      },
      {
        headerName: 'Related Entity Type',
        field: 'relatedEntityType.name',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Contract Rule',
        field: 'billingRule.name',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Price',
        field: 'calculatedAmount',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        ...AGGridHelper.amountColumnDefaultParams,
        cellRenderer: CurrencyHelper.toUsdFormat,
      },
      {
        headerName: 'Stage',
        field: 'invoiceStage',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Invoiced Amount',
        field: 'invoiceAmount',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        ...AGGridHelper.amountColumnDefaultParams,
        cellRenderer: CurrencyHelper.toUsdFormat,
      },
      {
        headerName: 'Invoice Number',
        field: 'invoiceNumber',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Invoice Date',
        field: 'invoicedDate',
        sortable: true,
        resizable: true,
        ...AGGridHelper.dateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
        cellRenderer: data => this.datePipe.transform(data.value, false, null, null, null, true),
      },
      {
        headerName: 'Paid Amount',
        field: 'paidAmount',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        ...AGGridHelper.amountColumnDefaultParams,
        cellRenderer: CurrencyHelper.toUsdFormat,
      },
      {
        headerName: 'Paid Date',
        field: 'paidDate',
        sortable: true,
        resizable: true,
        ...AGGridHelper.dateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
        cellRenderer: data => this.datePipe.transform(data.value, false, null, null, null, true),
      },
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    components: { },
  };
  constructor(
    private readonly store: Store<AppState>,
    protected readonly router: Router,
    protected readonly elementRef: ElementRef,
    private readonly datePipe: DateFormatPipe,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    this.store.dispatch(actions.UpdateClaimantsActionBar({ actionBar: this.actionBarActionHandlers }));
    this.subscribeToCurrentClaimant();
  }

  protected fetchData(params: IServerSideGetRowsParamsExtended): void {
    this.gridParams = params;
    this.addProjectIdFilterIntoSearchParams(this.currentProjectId, params);
    this.addClaimantIdFilterIntoSearchParams(this.currentClaimantId, params);
    this.store.dispatch(SearchInvoiceItems({ agGridParams: params }));
  }

  public gridReady(gridApi: GridApi): void {
    super.gridReady(gridApi);

    if (this.gridParams) {
      this.gridApi.setFilterModel(this.gridParams.request.filterModel);
    }
  }

  private subscribeToCurrentClaimant() {
    this.item$.pipe(
      first(claimant => !!claimant),
    ).subscribe(claimant => {
      this.currentProjectId = claimant.project.id;
      this.currentClaimantId = claimant.id;
    });
  }

  private addProjectIdFilterIntoSearchParams(projectId: number, params: IServerSideGetRowsParamsExtended): void {
    params.request.filterModel.push(new FilterModel({
      filter: projectId,
      filterType: FilterTypes.Number,
      key: 'caseId',
      type: 'equals',
    }));
  }

  private addClaimantIdFilterIntoSearchParams(claimantId: number, params: IServerSideGetRowsParamsExtended): void {
    params.request.filterModel.push(new FilterModel({
      filter: claimantId,
      filterType: FilterTypes.Number,
      key: 'clientId',
      type: 'equals',
    }));
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateClaimantsActionBar({ actionBar: null }));
    super.ngOnDestroy();
  }
}
