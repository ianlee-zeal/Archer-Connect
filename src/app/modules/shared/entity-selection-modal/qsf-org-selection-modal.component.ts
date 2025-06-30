import { GridId } from '@app/models/enums/grid-id.enum';
import { GridOptions, RowClickedEvent, RowDoubleClickedEvent } from 'ag-grid-community';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import * as sharedActions from '@app/modules/shared/state/entity-selection-modal/actions';
import { Component } from '@angular/core';
import { EntitySelectionModalComponent } from './entity-selection-modal.component';
import { CheckboxEditorRendererComponent } from '../_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { FilterModel } from '@app/models/advanced-search/filter-model';

@Component({
  selector: 'app-qsf-org-selection-modal',
  templateUrl: './entity-selection-modal.component.html',
})
export class QsfOrgSelectionModalComponent extends EntitySelectionModalComponent {
  gridId = GridId.QsfOrgSelection;
  entityLabel = 'qSFAdministrationOrg';
  private orgTypeIds: number[];
  gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Active',
        field: 'active',
        sortable: true,
        width: 60,
        maxWidth: 60,
        cellRenderer: 'activeRenderer',
        ...AGGridHelper.tagColumnDefaultParams,
      },
      {
        headerName: 'ID',
        field: 'id',
        width: 90,
        maxWidth: 90,
        sortable: true,
        resizable: false,
        ...AGGridHelper.getCustomTextColumnFilter({
          onlyNumbers: true,
          isAutofocused: true,
        }),
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
        headerName: 'Alt Name',
        field: 'altName',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Tax ID',
        field: 'taxId',
        sortable: true,
        width: 130,
        maxWidth: 130,
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
        headerName: 'Zip Code',
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
    isRowSelectable: rowNode => !!rowNode.data.active,
    components: { activeRenderer: CheckboxEditorRendererComponent },
  };
  gridDataFetcher = (params: IServerSideGetRowsParamsExtended) => this.store.dispatch(sharedActions.SearchQSFAdministrationOrg({
    params: {
      ...params,
      request: {
        ...params.request,
        filterModel: [...params.request.filterModel, new FilterModel({
          filter: this.orgTypeIds.toString(),
          filterType: 'number',
          type: 'contains',
          key: 'primaryOrgType.id',
        })],
      },
    },
  }));

  ngOnInit(): void {
    this.gridOptions.onRowClicked = (e: RowClickedEvent): void => {
      if (e.data.active) {
        this.selectedEntity = e.data;
      }
    };

    this.gridOptions.onRowDoubleClicked = (e: RowDoubleClickedEvent) => {
      if (e.data.active) {
        this.selectedEntity = e.data;
        this.onSave();
      }
    };
  }
}
