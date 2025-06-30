/* eslint-disable no-restricted-globals */
import { Component } from '@angular/core';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';

import { GridId } from '@app/models/enums/grid-id.enum';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { AppState } from '@app/state';
import { Store } from '@ngrx/store';
import { GridApi, GridOptions } from 'ag-grid-community';
import * as selectors from '@app/modules/payments/state/selectors';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-spr-check-verification-list',
  templateUrl: './spr-check-verification-list.component.html',
  styleUrls: ['./spr-check-verification-list.component.scss'],
})
export class SPRCheckVerificationListComponent {
  readonly gridId: GridId = GridId.SPRCheckVerificatoinList;
  public readonly payment$ = this.store.select(selectors.item);

  private gridApi: GridApi;
  protected ngUnsubscribe$ = new Subject<void>();

  readonly gridOptions: GridOptions = {
    animateRows: false,
    defaultColDef: {
      sortable: false,
    },
    columnDefs: [
      {
        headerName: 'Date Created',
        field: 'createdDate',
        cellRenderer: data => this.datePipe.transform(data.value, true),
        ...AGGridHelper.dateTimeColumnDefaultParams,
        filter: false,
        suppressMenu: true,
      },
      {
        headerName: 'ARCHER Agent',
        field: 'createdBy.displayName',
        ...AGGridHelper.nameColumnDefaultParams,
        filter: false,
        suppressMenu: true,
        minWidth: 170,
        width: 170,
      },

      {
        headerName: 'Bank Agent',
        field: 'agentsName',
        ...AGGridHelper.nameColumnDefaultParams,
        filter: false,
        suppressMenu: true,
      },
      {
        headerName: 'Financial Institution',
        field: 'financialInstitution',
        ...AGGridHelper.nameColumnDefaultParams,
        filter: false,
        suppressMenu: true,
      },
      {
        headerName: 'Phone Number',
        field: 'phone.number',
        ...AGGridHelper.nameColumnDefaultParams,
        filter: false,
        suppressMenu: true,
      },
    ],
    suppressRowClickSelection: true,
    pagination: false,
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
  };

  constructor(
    private readonly store: Store<AppState>,
    private readonly datePipe: DateFormatPipe,
  ) {

  }

  public gridReady(gridApi): void {
    this.gridApi = gridApi;
    this.gridApi.resetRowHeights();
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
