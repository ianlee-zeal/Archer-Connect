import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { GridApi, GridOptions } from 'ag-grid-community';
import { Store } from '@ngrx/store';

import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { AppState } from '@app/modules/projects/state';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { filter, takeUntil } from 'rxjs/operators';
import { TaskTemplate } from '@app/models/task-templates/task-template';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import * as sharedActions from '@app/modules/shared/state/task-details-template/actions';
import { taskDetailsTemplateSelectors } from '@app/modules/shared/state/task-details-template/selectors';
import { PermissionService } from '@app/services';
import { EntityTypeEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { dropDownsValuesSelectors } from '@app/modules/shared/state/drop-downs-values/selectors';
import * as dropDownsValuesActions from '@app/modules/shared/state/drop-downs-values/actions';
import * as actions from '../state/actions';
import { ActionPanelButtonsRendererComponent } from '../renderers/action-panel-buttons-renderer/action-panel-buttons-renderer.component';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

@Component({
  selector: 'app-task-templates-list',
  templateUrl: './task-templates-list.component.html',
  styleUrls: ['./task-templates-list.component.scss'],
})
export class TaskTemplatesListComponent extends ListView {
  public readonly gridId = GridId.TaskTemplatesList;
  public categories: SelectOption[] = [];
  public priorities: SelectOption[] = [];
  public lienStages: SelectOption[] = [];

  public categories$ = this.store.select(taskDetailsTemplateSelectors.taskCategories);
  public priorities$ = this.store.select(taskDetailsTemplateSelectors.priorities);
  public lienStages$ = this.store.select(dropDownsValuesSelectors.stages);

  public actionBarActionHandlers: ActionHandlersMap = {
    clearFilter: this.clearFilterAction(),
    new: {
      callback: () => this.createNew(),
      permissions: PermissionService.create(PermissionTypeEnum.TaskManagement, PermissionActionTypeEnum.Create),
    },
  };

  public gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    columnDefs: [
      {
        headerName: 'ID',
        field: 'id',
        colId: 'id',
        width: 50,
        maxWidth: 100,
        sortable: true,
        sort: 'desc',
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter({
          onlyNumbers: true,
          isAutofocused: true,
        }),
      },
      {
        headerName: 'Name',
        field: 'templateName',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Description',
        field: 'templateDescription',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Status',
        field: 'active',
        cellRenderer: data => (data.value ? 'Active' : 'Inactive'),
        sortable: true,
        minWidth: 150,
        width: 150,
        resizable: true,
        ...AGGridHelper.getActiveInactiveFilter(),
      },
      {
        headerName: 'Tasks Counter',
        field: 'tasksCount',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Sub-Tasks Counter',
        field: 'subTasksCount',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Standard SLA',
        field: 'standardSLA',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Priority',
        field: 'taskPriority.name',
        colId: 'taskPriority.id',
        sortable: true,
        minWidth: 150,
        width: 150,
        resizable: true,
        ...AGGridHelper.getDropdownColumnFilter({ options: this.priorities }),
      },
      {
        headerName: 'Category',
        field: 'taskCategory.name',
        colId: 'taskCategory.id',
        sortable: true,
        minWidth: 150,
        width: 150,
        resizable: true,
        ...AGGridHelper.getDropdownColumnFilter({ options: this.categories }),
      },
      {
        headerName: 'Associated Stage',
        colId: 'associatedStage.id',
        field: 'associatedStage.name',
        sortable: true,
        minWidth: 180,
        width: 180,
        resizable: true,
        ...AGGridHelper.getDropdownColumnFilter({ options: this.lienStages }),
      },
      AGGridHelper.getActionsColumn({ editHandler: this.onEditHandler.bind(this) }, 70, true),
    ],
    components: { buttonRenderer: ActionPanelButtonsRendererComponent },
    onRowDoubleClicked: this.onEditHandler.bind(this),
  };

  constructor(
    router: Router,
    elementRef: ElementRef,
    private readonly store: Store<AppState>,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    this.store.dispatch(sharedActions.GetTaskCategories());
    this.store.dispatch(sharedActions.GetPriorities());
    this.store.dispatch(dropDownsValuesActions.GetStages({ entityTypeId: EntityTypeEnum.LienProducts }));

    this.categories$.pipe(
      filter(items => items && !this.categories.length),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(categories => {
      this.categories.push(...categories);
    });

    this.priorities$.pipe(
      filter(items => items && !this.priorities.length),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(priorities => {
      this.priorities.push(...priorities);
    });

    this.lienStages$.pipe(
      filter(items => items && !this.lienStages.length),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(lienStages => {
      this.lienStages.push(...lienStages);
    });
  }

  protected fetchData(params: IServerSideGetRowsParamsExtended): void {
    this.gridParams = params;
    this.store.dispatch(actions.GetTaskTemplatesList({ gridParams: this.gridParams }));
  }

  public gridReady(gridApi: GridApi): void {
    super.gridReady(gridApi);

    if (this.gridParams) {
      this.gridApi.setFilterModel(this.gridParams.request.filterModel);
    }
  }

  private onEditHandler(param): void {
    const taskTemplate: TaskTemplate = param.data;
    this.router.navigate(['admin', 'task-templates', `${taskTemplate.id}`]);
  }

  protected createNew(): void {
    this.router.navigate(['admin/task-templates/new']);
  }
}
