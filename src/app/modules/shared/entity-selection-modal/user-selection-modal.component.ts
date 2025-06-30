import { GridId } from '@app/models/enums/grid-id.enum';
import { GridOptions } from 'ag-grid-community';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import * as sharedActions from '@app/modules/shared/state/entity-selection-modal/actions';
import { Component } from '@angular/core';
import { EntitySelectionModalComponent } from './entity-selection-modal.component';
import { CheckboxEditorRendererComponent } from '../_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

@Component({
  selector: 'app-user-selection-modal',
  templateUrl: './entity-selection-modal.component.html',
})
export class UserSelectionModalComponent extends EntitySelectionModalComponent {
  orgId: number;
  title = 'User Selection';
  gridId = GridId.UserSelection;
  entityLabel = 'users';

  gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Display Name',
        field: 'displayName',
        sortable: true,
        sort: 'asc',
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ isAutofocused: true }),
      },
      {
        headerName: 'User Name',
        field: 'userName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Email',
        field: 'email',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.emailColumnDefaultParams,
      },

      {
        headerName: 'Active',
        field: 'isActive',
        sortable: true,
        cellRenderer: 'checkboxRenderer',
        suppressSizeToFit: true,
        resizable: true,
        width: 90,
        ...AGGridHelper.getYesNoFilter(),
        ...AGGridHelper.tagColumnDefaultParams,
      },
    ],
    animateRows: false,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    components: { checkboxRenderer: CheckboxEditorRendererComponent },
  };

  gridDataFetcher = (params: IServerSideGetRowsParamsExtended) => this.store.dispatch(sharedActions.SearchArcherUsers({
    params:
    { ...params, request: { ...params.request, orgId: this.orgId } as any },
  }));
}
