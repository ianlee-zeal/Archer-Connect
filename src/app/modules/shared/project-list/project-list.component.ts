import { Component, Input, OnInit, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { GridApi, GridOptions } from 'ag-grid-community';
import { ActionsSubject, Store } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { ProjectActionPanelCellRendererComponent } from '@app/modules/projects/project-action-panel-cell-renderer/project-action-panel-cell-renderer.component';
import { AppState } from '@app/modules/projects/state';
import * as actions from '@app/modules/projects/state/actions';
import * as selectors from '@app/modules/projects/state/selectors';
import { CaseType, DefaultGlobalSearchType, EntityStatus, JobNameEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { GridId } from '@app/models/enums/grid-id.enum';
import { DecimalPipe } from '@angular/common';
import { CreateProjectModalComponent } from '@app/modules/projects/create-project-modal/create-project-modal.component';
import { ModalService, PermissionService } from '@app/services';
import { ColumnExport } from '@app/models';
import { ActionHandlersMap } from '../action-bar/action-handlers-map';
import { CreatePager } from '../state/common.actions';
import { RelatedPage } from '../grid-pager';
import { ValueWithTooltipRendererComponent } from '../_renderers/value-with-tooltip-renderer/value-with-tooltip-renderer.component';
import { ExportedListView } from '../_abstractions';
import { PusherService } from '../../../services/pusher.service';
import { EnumToArrayPipe } from '../_pipes/enum-to-array.pipe';
import { combineLatest, distinctUntilChanged, startWith, takeUntil } from 'rxjs';
import { HashTable } from '@app/models/hash-table';
import { FilterModel } from '@app/models/advanced-search/filter-model';
import * as rootActions from '@app/state/root.actions';

@Component({
  selector: 'app-projects-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
})
export class ProjectListComponent extends ExportedListView implements OnInit, AfterViewInit, OnDestroy {
  @Input() rowData;

  readonly gridId = GridId.Projects;
  readonly actionBar$ = this.store.select(selectors.actionBar);
  readonly downloadCompleteAction = actions.DownloadProjectsComplete;

  protected jobName = JobNameEnum.ProjectsList;
  protected exportOrder = [
    'ID',
    'Name',
    'Settlement',
    'Tort',
    'Type',
    'Managed in AC',
    'Primary Firm',
    'Active Claimants',
    'Inactive Claimants',
    'Status',
  ];
  protected advancedExportColumns: ColumnExport[];
  exportedFileName = 'Projects Export';

  public actionBar: ActionHandlersMap = {
    clearFilter: this.clearFilterAction(),
    new: {
      callback: () => this.openNewProjectModal(),
      permissions: PermissionService.create(PermissionTypeEnum.Projects, PermissionActionTypeEnum.Create),
    },
    download: {
      disabled: () => !this.canClearFilters() || this.isExporting || this.gridApi?.getDisplayedRowCount() === 0,
      options: [
        { name: 'Standard', callback: () => this.exportStandard(this.getExportColumns()) },
      ],
    },
    exporting: { hidden: () => !this.isExporting },
  };

  public gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'ID',
        field: 'id',
        width: 50,
        sortable: true,
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
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
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
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Type',
        field: 'projectType.name',
        colId: 'caseTypeId',
        cellRenderer: 'valueWithTooltip',
        minWidth: 100,
        width: 100,
        sortable: true,
        resizable: true,
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
        headerName: 'Managed in AC',
        field: 'isManagedInAC',
        colId: 'isManagedInAC',
        minWidth: 100,
        width: 100,
        sortable: true,
        resizable: true,
        cellRenderer: data => (data.value ? 'Yes' : 'No'),
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
      },
      {
        headerName: 'Primary Firm',
        field: 'organization.name',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Active Claimants',
        field: 'activeCount',
        width: 150,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        valueFormatter: data => this.decimalPipe.transform(data.value),
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
      },
      {
        headerName: 'Inactive Claimants',
        field: 'inactiveCount',
        width: 150,
        sortable: true,
        resizable: true,
        suppressSizeToFit: true,
        valueFormatter: data => this.decimalPipe.transform(data.value),
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
      },
      {
        headerName: 'Status',
        field: 'status.name',
        colId: 'status.id',
        sortable: true,
        minWidth: 100,
        width: 100,
        resizable: true,
        ...AGGridHelper.getDropdownColumnFilter({
          options: [
            {
              id: EntityStatus.LeadCase,
              name: 'Lead',
            },
            {
              id: EntityStatus.OnboardingCase,
              name: 'Onboarding',
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
      AGGridHelper.getActionsColumn({ editProjectHandler: this.onRowDoubleClicked.bind(this) }, 120, true),
    ],
    animateRows: false,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    components: {
      buttonRenderer: ProjectActionPanelCellRendererComponent,
      valueWithTooltip: ValueWithTooltipRendererComponent,
    },
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
  };

  public readonly searchType = DefaultGlobalSearchType.Projects;

  constructor(
    store: Store<AppState>,
    pusher: PusherService,
    enumToArray: EnumToArrayPipe,
    actionsSubject: ActionsSubject,
    protected readonly router: Router,
    protected readonly elementRef: ElementRef,
    protected readonly decimalPipe: DecimalPipe,
    private readonly modalService: ModalService,
    private route: ActivatedRoute,
  ) {
    super(router, elementRef, store, pusher, enumToArray, actionsSubject);
  }

  public ngAfterViewInit(): void {
    this.subscribeToGridUpdates();
  }

  protected fetchData(params): void {
    this.gridParams = params;
    this.store.dispatch(
      actions.GetAllProjectsActionRequest({ gridParams: this.gridParams }),
    );
  }

  public gridReady(gridApi): void {
    super.gridReady(gridApi);

    if (this.gridParams) {
      this.gridApi.setFilterModel(this.gridParams.request.filterModel);
    }
  }

  private subscribeToGridUpdates(): void {
    combineLatest([
      this.route.queryParams.pipe(
        startWith(this.route.snapshot.queryParams),
      ),
      this.gridReady$,
    ]).pipe(
      distinctUntilChanged((a: [Params, GridApi], b: [Params, GridApi]) => JSON.stringify(a[0]) === JSON.stringify(b[0])),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(([queryParams]: [Params, GridApi]) => {
      const gridFilters = AGGridHelper.extractFiltersFromQueryParams(queryParams, {
        id: 'number',
        name: 'string',
      });

      if (Object.keys(gridFilters).length !== 0)
      {
        this.applyGridFilters({ ...gridFilters });
      }
    });
  }

  private applyGridFilters(gridFilters: HashTable<FilterModel>): void {
    this.getGridApi()?.setFilterModel(gridFilters);
  }

   public clearFilters(): void {
    super.clearFilters();
    this.store.dispatch(rootActions.ClearGridLocalData({ gridId: this.gridId }));
    this.router.navigate(['projects']);
  }

  protected onRowDoubleClicked({ data }): void {
    const navSettings = AGGridHelper.getNavSettings(this.getGridApi());
    this.store.dispatch(
      CreatePager({
        relatedPage: RelatedPage.ProjectsFromSearch,
        settings: navSettings,
      }),
    );
    this.store.dispatch(actions.GotoProjectDetailsPage({ projectId: data.id, navSettings }));
  }

  private openNewProjectModal(): void {
    const initialState = { title: 'Add New Project' };
    this.modalService.show(CreateProjectModalComponent, {
      initialState,
      class: 'create-project-modal',
    });
  }

  protected dispatchExportAction(params: IServerSideGetRowsParamsExtended, exportColumns: ColumnExport[], channelName: string) {
    this.store.dispatch(actions.DownloadProjects({
      searchOptions: params.request,
      columns: exportColumns,
      channelName,
    }));
  }

  protected dispatchError(message: string) {
    this.store.dispatch(actions.Error({ error: message }));
  }

  // TODO
  protected dispatchUpdateActionBarAction() {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: this.actionBar }));
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: null }));
    super.ngOnDestroy();
  }
}
