import { Component } from '@angular/core';
import { EntitySelectionModalComponent } from './entity-selection-modal.component';
import { AGGridHelper } from '@app/helpers';
import { GridOptions } from 'ag-grid-community';
import * as projectActions from '@app/modules/projects/state/actions';
import { CaseType, GridId } from '@app/models/enums';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import { IServerSideGetRowsRequestExtended } from '../_interfaces/ag-grid/ss-get-rows-request';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { FilterModel } from '@app/models/advanced-search/filter-model';

@Component({
  selector: 'app-active-project-selection-modal',
  templateUrl: './entity-selection-modal.component.html',
})
export class ActiveProjectSelectionModalComponent
  extends EntitySelectionModalComponent
{
  title = 'Project Selection';
  gridId = GridId.ProjectSelection;
  searchParam: Partial<IServerSideGetRowsRequestExtended>;
  projectId: number;

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
        headerName: 'Project Name',
        field: 'name',
        sortable: true,
        sort: 'asc',
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Settlement',
        field: 'settlementName',
        colId: 'settlement.name',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Tort',
        field: 'matter',
        colId: 'tort',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Type',
        field: 'projectType.name',
        colId: 'caseTypeId',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getDropdownColumnFilter({
          options: [
            {
              id: CaseType.MassTort,
              name: 'Mass Tort',
            },
            {
              id: CaseType.SingleEvent,
              name: 'Single Event',
            },
            {
              id: CaseType.ClassAction,
              name: 'Class Action',
            },
          ],
        }),
      },
      {
        headerName: 'Primary Firm',
        field: 'organization.name',
        minWidth: 100,
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

  gridDataFetcher = (params: IServerSideGetRowsParamsExtended) => {
    this.store.dispatch(projectActions.GetAllProjectsActionRequest({ gridParams:  {
      ...params,
      request: {
        ...params.request,
        filterModel: [...params.request.filterModel, new FilterModel({
          filter: 'Active',
          filterType: FilterTypes.Text,
          type: 'equals',
          key: 'status.name',
        })],
      },
    }, }));
  };

}
