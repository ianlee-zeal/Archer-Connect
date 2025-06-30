import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { filter, first, takeUntil } from 'rxjs/operators';
/* eslint-disable no-restricted-globals */
import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionsSubject, Store } from '@ngrx/store';
import { GridOptions } from 'ag-grid-community';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { GridId } from '@app/models/enums/grid-id.enum';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { MessageService, ModalService, PermissionService } from '@app/services';
import { AppState } from '@shared/state';
import { SearchField } from '@app/models/advanced-search/search-field';
import { AdvancedSearchState } from '@app/modules/shared/state/advanced-search/reducer';
import { Observable } from 'rxjs';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { ofType } from '@ngrx/effects';
import { TaskManagementEntityEnum } from '@app/models/enums/task-management-entity.enum';
import { TaskTemplate } from '@app/models/task-templates/task-template';
import { SearchOptionsHelper } from '@app/helpers';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import * as templateActions from '@app/modules/admin/task-templates/state/actions';
import * as taskActions from '@app/modules/task/state/actions';
import { EntityTypeEnum } from '../../../../models/enums/entity-type.enum';
import * as actions from '../../state/task-details-template/actions';
import { taskDetailsTemplateSelectors } from '../../state/task-details-template/selectors';
import { TaskRequest } from '../../../../models/task-request';
import { ActionPanelButtonsRendererComponent } from '../renderers/action-panel-buttons-renderer/action-panel-buttons-renderer.component';
import { AddNewSubtaskModalComponent } from '../../add-new-subtask-modal/add-new-subtask-modal.component';

@Component({
  selector: 'app-sub-tasks-list',
  templateUrl: './sub-tasks-list.component.html',
  styleUrls: ['./sub-tasks-list.component.scss'],
})
export class SubTasksListComponent extends ListView implements OnInit {
  private entityId: number;
  private taskManagementEntity: TaskManagementEntityEnum;
  public searchFields: SearchField[];
  public advancedSearch$: Observable<AdvancedSearchState>;
  protected entityType: EntityTypeEnum;
  public bsModalRef: BsModalRef;
  private statuses: SelectOption [] = [];
  private categories: SelectOption [] = [];
  private subTasks: TaskRequest[] = [];
  private subTemplates: TaskTemplate[] = [];
  private templateId: number;

  readonly gridId: GridId = GridId.SubTasksList;

  public categories$ = this.store.select(taskDetailsTemplateSelectors.subTaskCategories);
  public subTasks$ = this.store.select(taskDetailsTemplateSelectors.subTasks);
  public subTemplates$ = this.store.select(taskDetailsTemplateSelectors.subTemplates);
  public stages$ = this.store.select(taskDetailsTemplateSelectors.stages);
  public templateId$ = this.store.select(taskDetailsTemplateSelectors.templateId);

  private editPermission = PermissionService.create(PermissionTypeEnum.TaskManagement, PermissionActionTypeEnum.Edit);

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Task ID',
        field: 'id',
        width: 50,
        sortable: true,
        suppressSizeToFit: true,
        valueFormatter: data => { return (data.data.notExisting ? '-': data.value)},
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
      },
      {
        headerName: 'Sub-task Name',
        field: 'name',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Description',
        field: 'description',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Assignee',
        field: 'assigneeUser.displayName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Category',
        field: 'taskCategory.id',
        sortable: true,
        cellRenderer: ({ data }) => data.taskCategory.name, // to make sorting and filtering work for client side grid
        ...AGGridHelper.getDropdownColumnFilter({ options: this.categories }),
        maxWidth: 175,
      },
      {
        headerName: 'Stage',
        field: 'stage.id',
        sortable: true,
        cellRenderer: ({ data }) => data.stage.name, // to make sorting and filtering work for client side grid
        ...AGGridHelper.getDropdownColumnFilter({ options: this.statuses }),
        maxWidth: 175,
      },
      {
        headerName: 'Due Date',
        field: 'dueDate',
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value),
        ...AGGridHelper.dateTimeColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Completed Date',
        field: 'completedDate',
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value),
        ...AGGridHelper.dateTimeColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
    ],
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    animateRows: false,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    components: { buttonRenderer: ActionPanelButtonsRendererComponent },
    onRowDoubleClicked: this.onEditHandler.bind(this),
  };

  constructor(
    public store: Store<AppState>,
    public modalService: ModalService,
    public messageService: MessageService,
    public route: ActivatedRoute,
    private datePipe: DateFormatPipe,
    protected elementRef: ElementRef,
    protected router: Router,
    public permissionService: PermissionService,
    private readonly actionsSubject: ActionsSubject,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    this.entityId = +this.router.url.split('/')[3];

    this.route.data.subscribe(({ parentComponent }) => {
      this.taskManagementEntity = parentComponent;
    });

    this.gridParams = { request: { ...SearchOptionsHelper.getFilterRequest([]) } } as IServerSideGetRowsParamsExtended;

    if (this.entityId) {
      this.gridOptions.columnDefs.push(
        AGGridHelper.getActionsColumn({
          editHandler: this.onEditHandler.bind(this)
        }, 70, true)
      );
      this.getData();
    }

    this.categories$.pipe(
      first(item => !!item),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(dropdownValues => {
      this.categories.push(...dropdownValues);
    });

    this.stages$.pipe(
      first(item => !!item),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(dropdownValues => {
      this.statuses.push(...dropdownValues);
    });

    this.templateId$.pipe(
      filter(item => !!item),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(templateId => {
      this.templateId = templateId;
    });

    this.subTasks$.pipe(
      filter(item => !!item),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(subTasks => {
      this.subTasks = subTasks;
      this.gridApi?.setGridOption('rowData', this.subTasks);
    });

    this.subTemplates$.pipe(
      filter(item => !!item),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(subTemplates => {
      this.subTemplates = subTemplates;
      this.gridApi?.setGridOption('rowData', [...this.subTasks, ...this.subTemplates]);
    });

    this.actionsSubject
      .pipe(
        ofType(
          actions.CreateSubTaskComplete,
          actions.UpdateSubTaskComplete,
          templateActions.UpdateTemplateComplete,
          taskActions.UpdateTaskComplete,
        ),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe(() => {
        this.getData();
      });

    this.store.dispatch(actions.GetPriorities());
  }

  public gridReady(gridApi): void {
    this.gridApi = gridApi;
  }

  protected fetchData(): void {}

  private getData() {
    if (this.taskManagementEntity === TaskManagementEntityEnum.Task) {
      this.getSubTasksList();
    } else {
      this.getSubTemplatesList();
    }
  }

  private getSubTasksList() {
    this.store.dispatch(actions.GetSubTasksList({ entityId: this.entityId, gridParams: this.gridParams }));
  }

  private getSubTemplatesList(entityId = this.entityId) {
    this.store.dispatch(actions.GetSubTemplateList({ entityId, gridParams: this.gridParams, existing: true }));
  }

  private onEditHandler(param): void {
    if (this.permissionService.has(this.editPermission) && !param?.data?.notExisting) {
      this.modalService.show(AddNewSubtaskModalComponent, {
        class: 'add-new-subtask-modal',
        initialState: {
          parentId: this.entityId,
          parentCategoryId: param.data?.taskCategory?.id,
          parentCategory: param.data?.taskCategory,
          taskManagementEntity: this.taskManagementEntity,
          recordId: param.data?.id,
          record: param.data,
          templateName: param.data?.templateName,
        },
      });
    }
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.ClearSubEntitiesGrids());
    this.templateId = 0;
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
