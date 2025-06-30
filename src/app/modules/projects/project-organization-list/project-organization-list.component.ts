import { Component, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { Store } from '@ngrx/store';
import { CellClassParams, ColDef, GridOptions } from 'ag-grid-community';
import { AppState } from '@shared/state';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { filter, first, takeUntil } from 'rxjs/operators';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import * as commonActions from '@app/modules/shared/state/common.actions';
import { CheckboxEditorRendererComponent } from '@app/modules/shared/_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';
import { EntityTypeEnum, ExportLoadingStatus, JobNameEnum } from '@app/models/enums';
import * as exportsActions from '@shared/state/exports/actions';
import { exportsSelectors } from '@app/modules/shared/state/exports/selectors';
import { PusherService } from '@app/services/pusher.service';
import { AddressPipe, EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { CommonHelper, StringHelper } from '@app/helpers';
import { ColumnExport, ProjectOrganizationItem } from '@app/models';
import { RelatedPage } from '@app/modules/shared/grid-pager';
import * as actions from '../state/actions';
import * as selectors from '../state/selectors';
import { ProjectOrganizationActionsRendererComponent } from './project-organization-actions-renderer/project-organization-actions-renderer.component';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

@Component({
  selector: 'app-project-organization-list',
  templateUrl: './project-organization-list.component.html',
  styleUrls: ['./project-organization-list.component.scss'],
})
export class ProjectOrganizationListComponent extends ListView implements OnInit {
  public readonly gridId: GridId = GridId.ProjectOrganizations;
  private readonly defaultPaymentAddress = 'Payment Address';
  private readonly defaultPaymentMethod = 'Payment Method';

  readonly actionBar$ = this.store.select(selectors.actionBar);
  readonly item$ = this.store.select(selectors.item);
  readonly projectOrgs$ = this.store.select(selectors.projectOrgs);

  public isExporting = false;
  public projectId: number;

  public gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Name',
        colId: 'id',
        field: 'organizationName',
        rowGroup: true,
        hide: true,
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        field: 'parentId',
        hide: true,
        aggFunc: this.showFirstValue,
      },
      {
        headerName: 'Type',
        field: 'type',
        aggFunc: this.showFirstValue,
        cellRenderer: this.childrenCellRenderer,
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Claimant Count',
        field: 'claimantCount',
        aggFunc: this.showFirstValue,
        cellRenderer: this.childrenCellRenderer,
        ...AGGridHelper.nameColumnDefaultParams,
        minWidth: 120,
        width: 120,
      },
      {
        headerName: 'Project',
        field: 'projectName',
        aggFunc: this.showFirstValue,
        cellRenderer: row => this.setProjectsGroupedColumnHeader(row, true),
        ...AGGridHelper.nameColumnDefaultParams,
        minWidth: 120,
        width: 120,
      },
      {
        headerName: 'Payment Instruction Level',
        field: 'defaultType',
        aggFunc: this.showFirstValue,
        cellRenderer: row => this.setGroupedColumnHeader(row, true),
        ...AGGridHelper.nameColumnDefaultParams,
        width: 170,
        minWidth: 170,
      },
      {
        headerName: this.defaultPaymentAddress,
        field: 'defaultPaymentAddress',
        valueGetter: row => this.addressPipe.transform(row.data?.defaultPaymentAddress),
        ...AGGridHelper.nameColumnDefaultParams,
        width: 170,
        minWidth: 170,
      },
      {
        headerName: 'Bank Account',
        field: 'defaultBankAccount',
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: this.defaultPaymentMethod,
        field: 'defaultPaymentMethod',
        ...AGGridHelper.nameColumnDefaultParams,
        width: 170,
        minWidth: 170,
      },
      {
        headerName: 'W-9',
        headerTooltip: 'W-9 On File',
        field: 'w9OnFile',
        maxWidth: 100,
        cellRenderer: 'activeRenderer',
        cellClass: (params: CellClassParams) => {
          if (!params?.data) {
            return '';
          }
          let result = 'ag-cell-before-edit ag-cell-before-edit-centered';
          if (!(params.data as ProjectOrganizationItem).organizationId) {
            result += ' invisible';
          }
          return result;
        },
        aggFunc: this.showFirstValue,
        ...AGGridHelper.tagColumnDefaultParams,
      },

      AGGridHelper.getActionsColumn({ viewHandler: this.onRowDoubleClicked.bind(this) }, 80),
    ],
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    animateRows: false,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    onRowDoubleClicked: event => this.onRowDoubleClicked(event.data || event.node.aggData),
    components: {
      buttonRenderer: ProjectOrganizationActionsRendererComponent,
      activeRenderer: CheckboxEditorRendererComponent,
    },

    groupRemoveSingleChildren: true,
    suppressAggFuncInHeader: true,
    showOpenedGroup: true,
    pagination: false,

    autoGroupColumnDef: {
      headerName: 'Name',
      cellRendererParams: { suppressCount: true },
      valueFormatter: data => (data.node.parent.allChildrenCount > 1 ? '' : data.value),
    },
  };

  public actionBarActionHandlers: ActionHandlersMap = {
    clearFilter: this.clearFilterAction(),
    download: {
      disabled: () => this.isExporting,
      options: [
        { name: 'Standard', callback: () => this.exportOrganizationsList() },
      ],
    },
    exporting: { hidden: () => !this.isExporting },
    back: () => this.store.dispatch(commonActions.GotoParentView('projects')),
  };

  constructor(
    router: Router,
    elementRef: ElementRef,
    private readonly store: Store<AppState>,
    private readonly pusher: PusherService,
    private readonly enumToArray: EnumToArrayPipe,
    private readonly addressPipe: AddressPipe,
  ) {
    super(router, elementRef);
  }

  ngOnInit(): void {
    this.actionBar$.pipe(
      first(),
    ).subscribe(actionBar => this.store.dispatch(actions.UpdateActionBar({ actionBar: { ...actionBar, ...this.actionBarActionHandlers } })));

    this.initExportSubscriptions();

    this.projectOrgs$.pipe(
      filter(projectOrgs => !!projectOrgs),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(projectOrgs => {
      this.setGridRowDataWithDelay(projectOrgs);
    });

    this.item$.pipe(
      filter(item => !!item),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(item => {
      this.projectId = item.id;
      this.store.dispatch(actions.GetProjectOrgs({ projectId: this.projectId }));
      const gridParams = {
        request: {
          filterModel: [
            {
              type: 'equals',
              filter: this.projectId,
              filterType: 'number',
              conditions: [],
              filterTo: null,
              key: 'caseIds',
            }
          ],
        } as IServerSideGetRowsRequestExtended,
      } as unknown as IServerSideGetRowsParamsExtended;
      this.gridParams = gridParams;
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected fetchData(_params: IServerSideGetRowsParamsExtended): void {}

  public onRowDoubleClicked(data: ProjectOrganizationItem): void {
    if (!data) {
      return;
    }
    const id = data.parentId || data.organizationId;
    this.store.dispatch(actions.GoToOrg({ id }));

    const pager = { payload: this.projectId };
    const settings = AGGridHelper.getNavSettings(this.gridApi);
    this.store.dispatch(commonActions.CreatePager({ relatedPage: RelatedPage.ProjectOrganizations, settings, pager }));
  }

  private initExportSubscriptions(): void {
    this.store.select(exportsSelectors.isExporting).pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(result => { this.isExporting = result; });
  }

  private exportOrganizationsList(): void {
    const channelName = StringHelper.generateChannelName(JobNameEnum.ExportProjectOrganizations, this.projectId, EntityTypeEnum.Projects);
    this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));
    this.actionBar$.pipe(first())
      .subscribe(actionBar => this.store.dispatch(actions.UpdateActionBar({ actionBar: { ...actionBar, ...this.actionBarActionHandlers } })));

    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }

    this.channel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(ExportLoadingStatus).map(i => i.name),
      this.exportOrganizationsListCallback.bind(this),
      this.downloadProjectOrgs.bind(this, channelName),
    );
  }

  private downloadProjectOrgs(channelName: string): void {
    const columns: ColDef[] = this.gridOptions.columnDefs;
    const params = this.getExportParams();

    const columnsParam: ColumnExport[] = columns
      .filter(column => column.field && column.field !== 'parentId')
      .map(item => ({
        name: item.headerName,
        field: item.field,
      }));

    this.store.dispatch(actions.DownloadProjectOrgs({ id: this.projectId, searchOptions: params.request, columns: columnsParam, channelName }));
  }

  private exportOrganizationsListCallback(data, event): void {
    this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
    this.actionBar$.pipe(first())
      .subscribe(actionBar => this.store.dispatch(actions.UpdateActionBar({ actionBar: { ...actionBar, ...this.actionBarActionHandlers } })));

    switch ((<any>ExportLoadingStatus[event])) {
      case ExportLoadingStatus.Complete:
        this.store.dispatch(actions.DownloadDocument({ id: data.docId }));
        break;
      case ExportLoadingStatus.Error:
        this.store.dispatch(actions.Error({ error: `Error exporting: ${data.message}` }));
        break;
      default:
        break;
    }
  }

  public showFirstValue(data) {
    return !CommonHelper.isNullOrUndefined(data.values[0]) ? data.values[0] : '';
  }

  public setGroupedColumnHeader(data, displayCount?: boolean) {
    return data.node.group && displayCount ? `Multiple Levels (${data.node.allChildrenCount})` : data.value;
  }

  public setProjectsGroupedColumnHeader(data, displayCount?: boolean) {
    if (data.node.group && displayCount) {
      const projectsNum = data.node.allLeafChildren?.filter(rn => rn.data?.projectName !== '').length;
      return projectsNum > 0 ? `Projects (${projectsNum})` : '';
    }
    return data.value;
  }

  public childrenCellRenderer(data) {
    return !data.node.group && data.node.parent.allChildrenCount > 1 ? '' : data.value;
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
    this.store.dispatch(actions.UpdateActionBar({ actionBar: null }));
  }
}
