import { GridId } from '@app/models/enums/grid-id.enum';
import { GridOptions } from 'ag-grid-community';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import * as sharedActions from '@app/modules/shared/state/entity-selection-modal/actions';
import { Component } from '@angular/core';
import { EntitySelectionModalComponent } from './entity-selection-modal.component';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { CheckboxEditorRendererComponent } from '@app/modules/shared/_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';

@Component({
  selector: 'app-project-contacts-selection-modal',
  templateUrl: './entity-selection-modal.component.html',
})
export class ProjectContactSelectionModalComponent extends EntitySelectionModalComponent {
  title = 'Contact Selection';
  gridId = GridId.ProjectContactSelection;
  entityLabel = 'contacts';
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
        headerName: 'User',
        field: 'userName',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'First Name',
        field: 'viewFirstName',
        sortable: true,
        sort: 'asc',
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Last Name',
        field: 'viewLastName',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Organization Name',
        field: 'viewOrgName',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Active?',
        field: 'active',
        sortable: true,
        cellRenderer: 'activeRenderer',
        ...AGGridHelper.tagColumnDefaultParams,
      },
    ],
    animateRows: false,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
     components: {
          activeRenderer: CheckboxEditorRendererComponent,
    },
  };
  gridDataFetcher = (params: IServerSideGetRowsParamsExtended) => this.store.dispatch(sharedActions.SearchProjectContacts({ params }));
}
