import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { Store } from '@ngrx/store';

import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { AppState } from '@app/modules/projects/state';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { WorkflowCommandFilterTypesEnum } from '@app/models/enums/workflow-command-filter-types.enum';
import { filter, takeUntil } from 'rxjs/operators';
import { IdValue } from '@app/models';
import { WorkflowCommand } from '@app/models/workflow-command';
import { workflowCommandFilters } from '../state/selectors';
import { GetWorkflowCommandsFilters } from '../state/actions';
import { ActionPanelButtonsRendererComponent } from '../renderers/action-panel-buttons-renderer/action-panel-buttons-renderer.component';
import * as actions from '../state/actions';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

@Component({
  selector: 'app-workflow-commands-list',
  templateUrl: './workflow-commands-list.component.html',
  styleUrls: ['./workflow-commands-list.component.scss'],
})
export class WorkflowCommandsListComponent extends ListView {
  public readonly gridId = GridId.WorkflowCommands;

  public actionBarActionHandlers: ActionHandlersMap = {
    clearFilter: this.clearFilterAction(),
    new: {
      callback: () => this.createNew(),
      permissions: PermissionService.create(PermissionTypeEnum.WorkflowCommands, PermissionActionTypeEnum.Create),
    },
  };

  public beginStages: IdValue[] = [];
  public readonly beginStages$ = this.store.select(workflowCommandFilters, { filterType: WorkflowCommandFilterTypesEnum.BeginStatus });

  public endStages: IdValue[] = [];
  public readonly endStages$ = this.store.select(workflowCommandFilters, { filterType: WorkflowCommandFilterTypesEnum.EndStatus });

  public paymentTypes: IdValue[] = [];
  public readonly paymentTypes$ = this.store.select(workflowCommandFilters, { filterType: WorkflowCommandFilterTypesEnum.PaymentType });

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
        field: 'name',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Description',
        field: 'description',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Begin Stage',
        field: 'beginStatus',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getDropdownColumnFilter({ options: this.beginStages, filterByName: true }, 'agTextColumnFilter'),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'End Stage',
        field: 'endStatus',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getDropdownColumnFilter({ options: this.endStages, filterByName: true }, 'agTextColumnFilter'),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Product Type',
        field: 'productType',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getDropdownColumnFilter({ options: this.paymentTypes, filterByName: true }, 'agTextColumnFilter'),
        ...AGGridHelper.nameColumnDefaultParams,
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
    this.store.dispatch(GetWorkflowCommandsFilters({ filterType: WorkflowCommandFilterTypesEnum.BeginStatus }));
    this.store.dispatch(GetWorkflowCommandsFilters({ filterType: WorkflowCommandFilterTypesEnum.EndStatus }));
    this.store.dispatch(GetWorkflowCommandsFilters({ filterType: WorkflowCommandFilterTypesEnum.PaymentType }));

    this.beginStages$.pipe(
      filter((items: IdValue[]) => !!items && !this.beginStages.length),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((options: IdValue[]) => {
      this.beginStages.push(...options);
    });

    this.endStages$.pipe(
      filter((items: IdValue[]) => !!items && !this.endStages.length),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((options: IdValue[]) => {
      this.endStages.push(...options);
    });

    this.paymentTypes$.pipe(
      filter((items: IdValue[]) => !!items && !this.paymentTypes.length),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((options: IdValue[]) => {
      this.paymentTypes.push(...options);
    });
  }

  protected fetchData(params: IServerSideGetRowsParamsExtended): void {
    this.gridParams = params;
    this.store.dispatch(actions.GetWorkflowCommandsList({ gridParams: this.gridParams }));
  }

  private onEditHandler(param): void {
    const workflowCommand: WorkflowCommand = param.data;
    this.router.navigate(['admin', 'workflow-commands', `${workflowCommand.id}`]);
  }

  protected createNew(): void {
    this.router.navigate(['admin/workflow-commands/new']);
  }
}
