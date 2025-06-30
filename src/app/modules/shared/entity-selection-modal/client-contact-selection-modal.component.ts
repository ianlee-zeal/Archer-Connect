import { GridId } from '@app/models/enums/grid-id.enum';
import { GridOptions } from 'ag-grid-community';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import * as sharedActions from '@app/modules/shared/state/entity-selection-modal/actions';
import { Component } from '@angular/core';
import { EntitySelectionModalComponent } from './entity-selection-modal.component';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

@Component({
  selector: 'app-client-contacts-selection-modal',
  templateUrl: './entity-selection-modal.component.html',
})
export class ClientContactSelectionModalComponent extends EntitySelectionModalComponent {
  title = 'Contact Selection';
  gridId = GridId.UserContactsSelection;
  entityLabel = 'contacts';
  clientId: number;
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
        headerName: 'First Name',
        field: 'person.firstName',
        colId: 'person.firstName',
        sortable: true,
        sort: 'asc',
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Last Name',
        field: 'person.lastName',
        colId: 'person.firstName',
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
  gridDataFetcher = (params: IServerSideGetRowsParamsExtended) => this.store.dispatch(sharedActions.SearchClientContacts({ params, clientId: this.clientId }));
}
