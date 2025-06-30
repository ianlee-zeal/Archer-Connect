import { GridId } from '@app/models/enums/grid-id.enum';
import { GridOptions } from 'ag-grid-community';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import * as sharedActions from '@app/modules/shared/state/entity-selection-modal/actions';
import { Component } from '@angular/core';
import { EntitySelectionModalComponent } from './entity-selection-modal.component';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

@Component({
  selector: 'app-customer-selection-modal',
  templateUrl: './entity-selection-modal.component.html',
})
export class CustomerSelectionModalComponent extends EntitySelectionModalComponent {
  title = 'Customer Selection';
  gridId = GridId.CustomerSelection;
  entityLabel = 'customers';
  gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'ID',
        field: 'id',
        width: 100,
        maxWidth: 100,
        sortable: true,
        resizable: false,
        ...AGGridHelper.getCustomTextColumnFilter({
          onlyNumbers: true,
          isAutofocused: true,
        }),
      },
      {
        headerName: 'Primary Firm',
        field: 'name',
        sortable: true,
        sort: 'asc',
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Address Line 1',
        field: 'primaryAddress.lineOne',
        sortable: true,
        ...AGGridHelper.addressColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Address Line 2',
        field: 'primaryAddress.lineTwo',
        sortable: true,
        ...AGGridHelper.addressColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'City',
        field: 'primaryAddress.city',
        sortable: true,
        ...AGGridHelper.cityColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'State',
        field: 'primaryAddress.state',
        sortable: true,
        ...AGGridHelper.stateColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Zip Сode',
        field: 'primaryAddress.zipCode',
        sortable: true,
        ...AGGridHelper.fixedColumnDefaultParams,
        width: 110,
        minWidth: 110,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
    ],
    animateRows: false,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
  };
  gridDataFetcher = (params: IServerSideGetRowsParamsExtended) => this.store.dispatch(sharedActions.SearchCustomers({ params }));
}
