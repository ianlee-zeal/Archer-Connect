import { GridId } from '@app/models/enums/grid-id.enum';
import { GridOptions } from 'ag-grid-community';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import * as sharedActions from '@app/modules/shared/state/entity-selection-modal/actions';
import { Component } from '@angular/core';
import { EntitySelectionModalComponent } from './entity-selection-modal.component';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

@Component({
  selector: 'app-settlement-selection-modal',
  templateUrl: './entity-selection-modal.component.html',
})
export class SettlementSelectionModalComponent extends EntitySelectionModalComponent {
  title = 'Settlement Selection';
  gridId = GridId.SettlementSelection;
  entityLabel = 'settlements';
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
        headerName: 'Settlement Name',
        field: 'name',
        sortable: true,
        sort: 'asc',
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Matter Name',
        field: 'matter.name',
        colId: 'tort.name',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Firm Name',
        field: 'org.name',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
    ],
    animateRows: false,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
  };
  gridDataFetcher = (params: IServerSideGetRowsParamsExtended) => this.store.dispatch(sharedActions.SearchSettlements({ params }));
}
