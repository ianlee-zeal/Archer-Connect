import { Directive, OnDestroy } from '@angular/core';
import { GridApi, GridOptions } from 'ag-grid-community';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { Subject } from 'rxjs';

@Directive()
export abstract class DeficienciesListBase implements OnDestroy {
  protected gridApi: GridApi;

  private readonly MAX_ROWS_NUMBER = 6;

  protected ngUnsubscribe$ = new Subject<void>();

  get isMaxRowsNumber(): boolean {
    return this.gridApi?.getDisplayedRowCount() > this.MAX_ROWS_NUMBER;
  }

  get rowHeight(): string {
    const headerHeight = 50;
    return `${this.MAX_ROWS_NUMBER * AGGridHelper.defaultGridOptions.rowHeight + headerHeight}px`;
  }

  public gridOptions: GridOptions = {
    animateRows: false,
    columnDefs: [
      {
        ...AGGridHelper.nameColumnDefaultParams,
        field: 'name',
        headerName: 'Deficiency',
        maxWidth: 400,
        cellClass: 'ag-cell-with-border',
      },
      {
        field: 'clients',
        headerName: 'Count of Clients',
        maxWidth: 120,
        cellClass: ['ag-cell-centered', 'ag-cell-with-border'],
        headerClass: 'ag-header-cell-centered ag-header-cell-centered__without-label',
      },
      {
        ...AGGridHelper.nameColumnDefaultParams,
        field: 'note',
        headerName: 'Description',
      },
    ],
    defaultColDef: {
      suppressMenu: true,
      autoHeight: true,
      wrapText: true,
      sortable: false,
    },
    pagination: false,
    suppressRowClickSelection: true,
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
  };

  onGridReady(gridApi: GridApi) {
    this.gridApi = gridApi;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
