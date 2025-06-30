import { GridId } from '@app/models/enums/grid-id.enum';
import { GridOptions } from 'ag-grid-community';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { Component } from '@angular/core';
import { EntitySelectionModalComponent } from './entity-selection-modal.component';
import { CheckboxEditorRendererComponent } from '../_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';

@Component({
  selector: 'app-organization-selection-modal',
  templateUrl: './entity-selection-modal.component.html',
})
export class OrganizationSelectionModalComponent extends EntitySelectionModalComponent {
  title = 'Organization Selection';
  gridId = GridId.Organizations;
  entityLabel = 'organizations';
  isActiveDisplayed: boolean;
  gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'ID',
        field: 'id',
        width: 100,
        maxWidth: 100,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
      },
      {
        headerName: 'Name',
        field: 'name',
        sortable: true,
        sort: 'asc',
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Type',
        field: 'primaryOrgTypeName',
        colId: 'primaryOrgType.name',
        sortable: true,
        width: 180,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Address',
        field: 'primaryAddress.lineOne',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.addressColumnDefaultParams,
      },
      {
        headerName: 'City',
        field: 'primaryAddress.city',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.cityColumnDefaultParams,
      },
      {
        headerName: 'State',
        field: 'primaryAddress.state',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.stateColumnDefaultParams,
      },
      {
        headerName: 'Zip Code',
        field: 'primaryAddress.zipCode',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.zipColumnDefaultParams,
      },
      {
        headerName: 'Primary Phone',
        field: 'primaryPhone.number',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.phoneColumnDefaultParams,
        width: 150,
      },
    ],
    animateRows: false,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    components: { activeRenderer: CheckboxEditorRendererComponent },
  };

  ngOnInit(): void {
    super.ngOnInit();

    if (this.isActiveDisplayed) {
      this.gridOptions.columnDefs.unshift({
        headerName: 'Active',
        field: 'active',
        sortable: true,
        cellRenderer: 'activeRenderer',
        ...AGGridHelper.tagColumnDefaultParams,
      });
    }
  }
}
