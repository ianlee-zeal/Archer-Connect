import { GridId } from '@app/models/enums/grid-id.enum';
import { GridOptions, RowSelectedEvent } from 'ag-grid-community';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import * as sharedActions from '@app/modules/shared/state/entity-selection-modal/actions';
import * as projectActions from '@app/modules/projects/state/actions';
import { CaseType, EntityStatus } from '@app/models/enums';
import { Component, OnDestroy } from '@angular/core';
import { GridRowToggleCheckbox } from '@app/state/root.actions';
import { SelectHelper } from '@app/helpers/select.helper';
import { EntitySelectionModalComponent } from './entity-selection-modal.component';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

@Component({
  selector: 'app-project-selection-modal',
  templateUrl: './entity-selection-modal.component.html',
})
export class ProjectSelectionModalComponent extends EntitySelectionModalComponent implements OnDestroy {
  title = 'Project Selection';
  gridId = GridId.ProjectSelection;
  entityLabel = 'Project Selection';
  isMultiple: boolean = false;
  isShowSettlement: boolean = false;
  orgId: number;
  key: string;

  gridOptions: GridOptions = {
    onRowSelected: this.onRowSelected.bind(this),
    columnDefs: [],
    animateRows: false,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
  };

  public ngOnInit(): void {
    this.gridOptions.columnDefs = [
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
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Project Code',
        field: 'projectCode',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
        minWidth: 120,
        width: 120,
      },
      {
        headerName: 'Settlement',
        field: 'settlementName',
        colId: 'settlement.name',
        sortable: true,
        hide: !this.isShowSettlement,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
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
        headerName: 'Status',
        field: 'status.name',
        colId: 'status.id',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        minWidth: 120,
        width: 120,
        ...AGGridHelper.getDropdownColumnFilter({
          options: [
            {
              id: EntityStatus.LeadCase,
              name: 'Lead',
            },
            {
              id: EntityStatus.ActiveCase,
              name: 'Active',
            },
            {
              id: EntityStatus.InactiveCase,
              name: 'Inactive',
            },
            {
              id: EntityStatus.CompleteCase,
              name: 'Complete',
            },
          ],
        }),
      },
      {
        headerName: 'Tort',
        field: 'matter',
        colId: 'tort',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
    ]
    if (!this.isMultiple) {
      super.ngOnInit();
    }

    if (this.isMultiple) {
      this.gridOptions = {
        ...this.gridOptions,
        columnDefs: [
          {
            width: 40,
            maxWidth: 40,
            checkboxSelection: true,
            pinned: 'left',
            hide: !this.isMultiple,
            floatingFilter: false,
          },
          ...this.gridOptions.columnDefs,
        ],
        defaultColDef: {
          ...AGGridHelper.defaultGridOptions.defaultColDef,
          floatingFilter: true,
        },
        rowSelection: 'multiple',
        rowMultiSelectWithClick: true,
      };
    }

    if (this.selectedEntities?.length) {
      this.store.dispatch(GridRowToggleCheckbox({ gridId: this.gridId, selectedRecordsIds: this.selectedRecordsIds }));
    }
  }

  public get selectedRecordsIds(): Map<string, boolean> {
    return new Map<string, boolean>(this.selectedEntities.map((entity: any) => [entity.key, entity.selected]));
  }

  private onRowSelected(event: RowSelectedEvent): void {
    if (event.node.rowIndex !== null) {
      const { data } = event.node;
      const existingRecord = this.selectedEntities.find((entity: any) => +entity.key === data.id);

      if (existingRecord) {
        existingRecord.selected = event.node.isSelected();
      } else {
        const newRecord = { ...SelectHelper.toKeyValuePair(data), selected: event.node.isSelected() };
        this.selectedEntities.push(newRecord);
      }

      this.store.dispatch(GridRowToggleCheckbox({ gridId: this.gridId, selectedRecordsIds: this.selectedRecordsIds }));
    }
  }

  public onSave(): void {
    if (this.isMultiple) {
      let selectedRecords = [];
      selectedRecords = this.selectedEntities.filter((item: any) => !!item.selected);
      this.onEntitySelected(selectedRecords);
    } else {
      this.onEntitySelected(this.selectedEntity);
    }
    this.modalRef.hide();
  }

  gridDataFetcher = (params: IServerSideGetRowsParamsExtended): void => {
    if (this.orgId) {
      this.store.dispatch(sharedActions.SearchProjects({ params, orgId: this.orgId, key: this.key }));
    } else {
      this.store.dispatch(projectActions.GetAllProjectsActionRequest({ gridParams: params }));
    }
  };

  public ngOnDestroy(): void {
    this.selectedEntities = [];
    super.ngOnDestroy();
  }
}
