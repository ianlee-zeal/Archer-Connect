import { first, takeUntil } from 'rxjs/operators';
/* eslint-disable no-restricted-globals */
import { Component, ElementRef, OnInit, Input, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { GridOptions } from 'ag-grid-community';
import { BsModalRef } from 'ngx-bootstrap/modal';
import * as exportsActions from '@app/modules/shared/state/exports/actions';
import * as commonSharedActions from 'src/app/modules/shared/state/index';
import cloneDeep from 'lodash-es/cloneDeep';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { DateFormatPipe, EnumToArrayPipe, YesNoPipe } from '@app/modules/shared/_pipes';
import { MessageService, ModalService, PermissionService } from '@app/services';
import { AppState } from '@shared/state';

import { GridHeaderCheckboxComponent } from '@app/modules/shared/grid/grid-header-checkbox/grid-header-checkbox.component';
import { AdvancedSearchListView } from '@app/modules/shared/_abstractions/advanced-search-list-view';
import { SearchField } from '@app/models/advanced-search/search-field';
import { AdvancedSearchState } from '@app/modules/shared/state/advanced-search/reducer';
import { Observable } from 'rxjs';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import * as sharedActions from '@app/modules/shared/state/task-details-template/actions';
import { taskDetailsTemplateSelectors } from '@app/modules/shared/state/task-details-template/selectors';
import { ExportLoadingStatus, JobNameEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { EntityTypeEnum } from '../../../../models/enums/entity-type.enum';
import * as actions from '../../state/actions';
import { ColumnExport } from '@app/models';
import { StringHelper } from '@app/helpers';
import { PusherService } from '@app/services/pusher.service';
import { LogService } from '@app/services/log-service';
import { IExportRequest } from '@app/models/export-request';
import { gridLocalDataByGridId } from '@app/state'
import { IGridLocalData } from '@app/state/root.state'
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

@Component({
  selector: 'app-task-management-list',
  templateUrl: './task-management-list.component.html',
  styleUrls: ['./task-management-list.component.scss'],
})
export class TaskManagementListComponent extends AdvancedSearchListView implements OnInit {
  @Input() listFilter: any;
  @Input() clearDashFilters: Function;

  public searchFields: SearchField[];
  public advancedSearch$: Observable<AdvancedSearchState>;
  protected entityType: EntityTypeEnum;
  public bsModalRef: BsModalRef;
  private stages: SelectOption [] = [];
  private priorities: SelectOption [] = [];
  private teams: SelectOption [] = [];
  private gridLocalData: IGridLocalData;

  readonly gridId: GridId = GridId.TaskManagement;

  public stages$ = this.store.select(taskDetailsTemplateSelectors.stages);
  public priorities$ = this.store.select(taskDetailsTemplateSelectors.priorities);
  public teams$ = this.store.select(taskDetailsTemplateSelectors.teams);
  private gridLocalData$ = this.store.select(gridLocalDataByGridId({ gridId: this.gridId }));

  readonly actionBar: ActionHandlersMap = {
    new: {
      callback: () => this.addNew(),
      permissions: PermissionService.create(PermissionTypeEnum.TaskManagement, PermissionActionTypeEnum.Create),
    },
    download: {
      disabled: () => false,
      options: [
        { name: 'Standard', callback: () => this.export() },
      ],
    },
    clearFilter: {
      callback: () => this.clearAllFilters(),
      disabled: () => this.isClearAllFiltersDisabled(),
    },
  };

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        width: 40,
        maxWidth: 40,
        checkboxSelection: true,
        headerComponent: GridHeaderCheckboxComponent,
        headerComponentParams: { gridId: this.gridId, floatingFilter: false, pinned: true },
        pinned: 'left',
        floatingFilter: false,
      },
      {
        headerName: 'Task ID',
        field: 'id',
        width: 50,
        sortable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
      },
      {
        headerName: 'Task Name',
        field: 'name',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Parent Task ID',
        field: 'parent.id',
        colId: 'parentId',
        sortable: true,
        cellRenderer: data => (data?.value ? data.value : 'N/A'),
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Parent Task',
        field: 'parent.name',
        colId: '@parent.name',
        sortable: true,
        cellRenderer: data => (data?.value ? data.value : 'N/A'),
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Priority',
        field: 'taskPriority.name',
        colId: 'taskPriorityId',
        width: 100,
        sortable: true,
        ...AGGridHelper.getDropdownColumnFilter({ options: this.priorities }),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Stage',
        field: 'stage.name',
        colId: 'currentStageId',
        sortable: true,
        ...AGGridHelper.getDropdownColumnFilter({ options: this.stages }),
        maxWidth: 175,
      },
      {
        headerName: 'Date Create',
        field: 'createdDate',
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value),
        ...AGGridHelper.dateTimeColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
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
      {
        headerName: 'Assigned To',
        field: 'assigneeUser.displayName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Project Code',
        field: 'project.projectCode',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },

      {
        headerName: 'Last Modified Date',
        field: 'lastModifiedDate',
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value),
        ...AGGridHelper.dateTimeColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Resp Dept',
        field: 'team.name',
        colId: 'taskTeamId',
        sortable: true,
        ...AGGridHelper.getDropdownColumnFilter({ options: this.teams }),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Blocked',
        field: 'blocked',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
        cellRenderer: data => this.yesNoPipe.transform(data.value),
      },
      {
        headerName: 'Days Overdue',
        field: 'daysOverdue',
        sortable: true,
        cellRenderer: data => (data.value > 0 ? Math.floor(data.value).toString() : ''),
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
      },
      {
        headerName: 'In Tolerance',
        field: 'inTolerance',
        sortable: true,
        cellRenderer: data => this.yesNoPipe.transform(data.value),
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
      },
    ],
    animateRows: false,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    suppressRowClickSelection: true,
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
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
    private readonly yesNoPipe: YesNoPipe,
    private readonly pusher: PusherService,
    private readonly enumToArray: EnumToArrayPipe,
    private readonly logger: LogService,
  ) {
    super(store, modalService, messageService, route, elementRef, router, permissionService);
  }

  public ngOnInit(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: this.actionBar }));

    this.stages$.pipe(
      first(item => !!item),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(dropdownValues => {
      this.stages.push(...dropdownValues);
    });

    this.priorities$.pipe(
      first(item => !!item),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(dropdownValues => {
      this.priorities.push(...dropdownValues);
    });

    this.teams$.pipe(
      first(item => !!item),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(dropdownValues => {
      this.teams.push(...dropdownValues);
    });
    this.subscribeToGridLocalData();

    this.store.dispatch(sharedActions.GetPriorities());
    this.store.dispatch(sharedActions.GetStages());
    this.store.dispatch(sharedActions.GetTeams());
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.listFilter?.currentValue) {
      this.onFilterChanged(changes.listFilter.currentValue);
    }
  }

  private subscribeToGridLocalData(): void {
    this.gridLocalData$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(gridLocalData => {
        this.gridLocalData = gridLocalData;
      });
  }

  private isClearAllFiltersDisabled() {
    return !this.listFilter?.length && !this.canClearFilters();
  }

  private clearAllFilters() {
    this.clearFilters();
    if (this.clearDashFilters) {
      this.clearDashFilters();
    }
  }

  private onRowDoubleClicked({ data }): void {
    this.router.navigate(['tasks', 'task-management', `${data?.parent?.id ? data.parent.id : data.id}`]);
  }

  public gridReady(gridApi): void {
    this.gridApi = gridApi;
  }

  public onFilterChanged(filterModel:any):void {
    if (this.gridParams) {
      this.gridParams.request.filterModel = filterModel;
      this.store.dispatch(actions.GetTasksList({ agGridParams: this.gridParams }));
    }
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = agGridParams;
    if (this.listFilter?.length) {
      this.gridParams.request.filterModel = [...this.gridParams.request.filterModel, ...this.listFilter];
    }
    this.store.dispatch(actions.GetTasksList({ agGridParams: this.gridParams }));
  }

  protected saveAdvancedSearch(): void {}

  private addNew() {
    this.router.navigate(['/tasks/task-management/new']);
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: null }));
    this.bsModalRef?.hide();
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  private export(): void {
    this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));

    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }

    const channelName = StringHelper.generateChannelName(JobNameEnum.ExportTasks);

    this.channel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(ExportLoadingStatus).map(i => i.name),
      this.exportCallback.bind(this),
      () => {
        const exportRequest: IExportRequest = {
          name: 'Tasks List',
          channelName,
          columns: this.getExportColumns(),
          searchOptions: this.getStandardExportParams(this.gridLocalData),
        };
        this.store.dispatch(actions.ExportTasks({ exportRequest }));
      },
    );
  }

  private exportCallback(data, event): void {
    switch ((<any>ExportLoadingStatus[event])) {
      case ExportLoadingStatus.Complete:
        this.store.dispatch(commonSharedActions.sharedActions.documentsListActions.DownloadDocument({ id: data.docId }));
        this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
        break;
      case ExportLoadingStatus.Error:
        this.logger.log('Error during export', data, event);
        this.store.dispatch(actions.Error({ errorMessage: data.message }));
        this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
        break;
      default:
        break;
    }
  }

  private getExportColumns(): ColumnExport[] {
    const columns: ColumnExport[] = [
      { name: 'Task ID', field: 'id' },
      { name: 'Task Name', field: 'name' },
      { name: 'Parent Task ID', field: 'parent.id' },
      { name: 'Priority', field: 'taskPriority.name' },
      { name: 'Stage', field: 'stage.name' },
      { name: 'Date Created', field: 'createdDate' },
      { name: 'Due Date', field: 'dueDate' },
      { name: 'Assigned To', field: 'assigneeUser.name' },
      { name: 'Project Code', field: 'projectCode' },
      { name: 'Resp Dept', field: 'taskTeam.name' },
      { name: 'Date Completed', field: 'completedDate' },
      { name: 'Blocked', field: 'blocked' },
      { name: 'Days Overdue', field: 'daysOverdue' },
      { name: 'In Tolerance', field: 'inTolerance' },
    ]

    return columns;
  }

  private getExportSearchParam(): IServerSideGetRowsRequestExtended {
    const searchParams: IServerSideGetRowsRequestExtended = cloneDeep(this.getExportParams().request);

    return searchParams;
  }
}
