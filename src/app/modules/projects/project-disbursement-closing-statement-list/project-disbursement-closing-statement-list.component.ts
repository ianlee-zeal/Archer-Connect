/* eslint-disable no-nested-ternary */
import { Document } from '@app/models/documents';
import { ModalService, PermissionService } from '@app/services';
import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { GridId } from '@app/models/enums/grid-id.enum';
import { GridHeaderCheckboxComponent } from '@app/modules/shared/grid/grid-header-checkbox/grid-header-checkbox.component';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { DateFormatPipe, EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { LinkActionRendererComponent } from '@app/modules/shared/_renderers/link-action-renderer/link-action-renderer.component';
import { ActionsSubject, Store } from '@ngrx/store';
import { ColDef, GridOptions } from 'ag-grid-community';
import * as fromShared from '@app/state';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { first, takeUntil } from 'rxjs/operators';
import { HtmlTooltipRendererComponent } from '@app/modules/shared/_renderers/html-tooltip-renderer/html-tooltip-renderer.component';
import { ExportLoadingStatus, JobNameEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import * as exportsActions from '@shared/state/exports/actions';
import { ColumnExport } from '@app/models';
import { PusherService } from '@app/services/pusher.service';
import { SearchOptionsHelper, StringHelper } from '@app/helpers';
import { ofType } from '@ngrx/effects';
import { IGridLocalData } from '@app/state/root.state';
import { ISearchOptions } from '@app/models/search-options';
import { exportsSelectors } from '@shared/state/exports/selectors';
import { ClearSelectedRecordsState } from '@app/state/root.actions';
import { CheckboxEditorRendererComponent } from '@app/modules/shared/_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';
// eslint-disable-next-line import/no-cycle
import { BatchDetailsModalComponent } from '../project-disbursement-closing-statement/batch-details-modal/batch-details-modal.component';
import * as projectSelectors from '../state/selectors';
import * as projectActions from '../state/actions';
import { ClosingStatementRendererComponent } from '../project-disbursement-closing-statement/renderers/closing-statement-buttons-renderer';
import { FilterModel } from '@app/models/advanced-search/filter-model';
import { VoidClosingStatmentDialogModelComponent } from '../project-disbursement-closing-statement/void-closing-statment-dialog-model/void-closing-statment-dialog-model.component';
import { gridLocalDataByGridId } from '@app/state';

@Component({
  selector: 'app-project-disbursement-closing-statement-list',
  templateUrl: './project-disbursement-closing-statement-list.component.html',
  styleUrls: ['./project-disbursement-closing-statement-list.component.scss'],
})
export class ProjectDisbursementClosingStatementListComponent extends ListView implements OnInit {
  @Input() batchId: number;
  @Input() projectId: number;
  @Input() gridId: GridId = GridId.ProjectDisbursementClosingStatement;
  @Input() isModal: boolean = false;

  public isExporting = false;
  public editPermission = PermissionService.create(PermissionTypeEnum.ProjectsClosingStatement, PermissionActionTypeEnum.Edit);
  private gridLocalData: IGridLocalData;
  private closingStatementGridParams: IServerSideGetRowsParamsExtended;

  public actionBar$ = this.store.select(projectSelectors.actionBar);
  public gridLocalData$ = this.store.select(gridLocalDataByGridId({ gridId: this.gridId }));

  private actionBar: ActionHandlersMap = {
    clearFilter:
    {
      disabled: () => !this.hasSelectedRow,
      callback: (): void => {
        this.store.dispatch(ClearSelectedRecordsState({ gridId: this.gridId }));
        this.gridApi.deselectAll();
      },
    },
    download: {
      disabled: () => this.isExporting,
      options: [{
        name: 'Standard',
        disabled: () => !this.hasSelectedRow,
        callback: () => this.exportClosingStatementList(this.getAllColumnDefs()),
      }],
      permissions: this.editPermission,
    },
    exporting: { hidden: () => !this.isExporting },
    voidClosingStatement: {
      disabled: () => !this.hasSelectedRow,
      hidden: () => false,
      permissions: PermissionService.create(PermissionTypeEnum.ProjectsClosingStatement, PermissionActionTypeEnum.VoidClosingStatement),
      callback: () => this.openVoidClosingStatemntDialogBox(),
    }
  }

  public gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Client ID',
        field: 'closingStatement.clientId',
        width: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Name',
        field: 'closingStatement.person.fullName',
        width: 140,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Recipient Name',
        field: 'closingStatement.recipientName',
        width: 140,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Primary Firm',
        field: 'primaryFirmName',
        width: 140,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Doc Template Name',
        field: 'closingStatement.documentTemplateName',
        width: 140,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Doc Name',
        field: 'name',
        sortable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Doc ID',
        field: 'id',
        width: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Delivery Method',
        field: 'closingStatement.deliveryMethod',
        colId: 'closingStatement.isElectronicDeliveryEnabled',
        sortable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getDeliveryMethodFilter(),
      },
      {
        headerName: 'E-Delivery Status',
        field: 'closingStatement.electronicDelivery.externalStatus',
        sortable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Is Replaced',
        field: 'closingStatement.isReplaced',
        cellRenderer: 'yesNoRenderer',
        sortable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
      },
      {
        headerName: 'Election Form Required',
        field: 'closingStatement.electionFormRequired',
        cellRenderer: 'yesNoRenderer',
        sortable: true,
        suppressSizeToFit: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getTruthyFalsyYesNoFilter(),
      },
      {
        headerName: 'Address',
        field: 'closingStatement.address.address.line1',
        colId: 'closingStatement.address.address.lineOne',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.addressColumnDefaultParams,
      },
      {
        headerName: 'City',
        field: 'closingStatement.address.address.city',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.cityColumnDefaultParams,
      },
      {
        headerName: 'State',
        field: 'closingStatement.address.address.state',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.stateColumnDefaultParams,
      },
      {
        headerName: 'Zip Code',
        field: 'closingStatement.address.address.zip',
        colId: 'closingStatement.address.address.zipCode',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.zipColumnDefaultParams,
      },
      {
        headerName: 'E-mail',
        field: 'closingStatement.email.emailValue',
        sortable: true,
        ...AGGridHelper.emailColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Tracking ID',
        field: 'trackingIdentifier',
        width: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Created Date',
        field: 'createdDate',
        sortable: true,
        cellRenderer: data => this.datePipe.transform(data.value, false, null, null, true),
        ...AGGridHelper.lastModifiedDateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: 'Created By',
        field: 'createdBy.displayName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.lastModifiedByColumnDefaultParams,
      },
    ],
    suppressRowClickSelection: true,
    components: {
      linkActionRenderer: LinkActionRendererComponent,
      buttonRenderer: ClosingStatementRendererComponent,
      htmlTooltip: HtmlTooltipRendererComponent,
      yesNoRenderer: CheckboxEditorRendererComponent,
    },
  };

  constructor(
    private readonly store: Store<fromShared.AppState>,
    private readonly datePipe: DateFormatPipe,
    private readonly modalService: ModalService,
    private readonly pusher: PusherService,
    private readonly actionsSubj: ActionsSubject,
    private readonly enumToArray: EnumToArrayPipe,
    private readonly permissionService: PermissionService,
    router: Router,
    elementRef: ElementRef,
  ) {
    super(router, elementRef);
  }

  ngOnInit(): void {
    this.actionBar$
      .pipe(first())
      .subscribe(
        actionBar => this.store.dispatch(projectActions.UpdateActionBar({
          actionBar: { ...actionBar, ...this.actionBar }
        })));

    this.store.select(exportsSelectors.isExporting).pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(result => { this.isExporting = result; });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(projectActions.DownloadClosingStatementListComplete),
    )
      .subscribe(() => {
        this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));
        this.store.dispatch(projectActions.UpdateActionBar({ actionBar: this.actionBar }));
      });

    if (!this.batchId) {
      this.subscribeToActionBar();
    }
    this.addColumnsToGrid();
    this.subscribeToData();
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = agGridParams;

    if (this.batchId) {
      this.gridParams.request.filterModel = [
        ...this.gridParams.request.filterModel,
        new FilterModel({
          filter: this.batchId,
          filterType: 'number',
          type: 'equals',
          key: 'closingStatement.batchId',
        }),
      ];
    }

    this.store.dispatch(projectActions.GetClosingStatementList({ caseId: this.projectId, agGridParams: this.gridParams }));
  }

  public refreshGrid(): void {
    if (this.gridApi) {
      this.gridApi.refreshServerSide({ purge: true });
    }
  }

  private subscribeToActionBar() {
    this.actionBar$
      .pipe(first())
      .subscribe(actionBar => this.store.dispatch(projectActions.UpdateActionBar({
        actionBar: {
          ...actionBar,
          clearFilter: {
            callback: (): void => {
              this.store.dispatch(ClearSelectedRecordsState({ gridId: this.gridId }));
              this.clearFilters();
            },
          },
          download: {
            disabled: () => this.isExporting,
            options: [{
              name: 'Standard',
              disabled: () => !this.hasSelectedRow,
              callback: () => this.exportClosingStatementList(this.getAllColumnDefs()),
            }],
            permissions: this.editPermission,
          },
          exporting: { hidden: () => !this.isExporting },
        },
      })));
  }

  public showViewNoteLink(e): boolean {
    return !!(e.data as Document).closingStatement?.batchId;
  }

  private addColumnsToGrid(): void {
    let batchIdColumn: ColDef = {
      headerName: 'Batch ID',
      field: 'closingStatement.batchId',
      width: 100,
      sortable: true,
      ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true, isAutofocused: true }),
      ...AGGridHelper.fixedColumnDefaultParams,
    };

    if (this.permissionService.has(this.editPermission)) {
      batchIdColumn = {
        ...batchIdColumn,
        tooltipComponent: 'htmlTooltip',
        tooltipValueGetter: data => (data.value ? 'View Batch' : null),
        cellRenderer: 'linkActionRenderer',
        cellRendererParams: {
          onAction: this.openBatchDetailsModal.bind(this),
          showLink: this.showViewNoteLink.bind(this),
        },
        hide: !!this.batchId,
      };
    }

    this.gridOptions = {
      ...this.gridOptions,
      columnDefs: [
        {
          width: 40,
          maxWidth: 40,
          checkboxSelection: true,
          headerComponent: GridHeaderCheckboxComponent,
          headerComponentParams: { gridId: this.gridId, floatingFilter: false, pinned: true },
          pinned: 'left',
          floatingFilter: false,
          hide: !!this.batchId,
        },
        batchIdColumn,
        ...this.gridOptions.columnDefs,
      ],
      defaultColDef: {
        ...this.gridOptions.defaultColDef,
        floatingFilter: !this.batchId,
      },
    };

    if (!this.batchId) {
      this.gridOptions.columnDefs.push(AGGridHelper.getActionsColumn({ downloadHandler: this.downloadCS.bind(this) }));
    }
  }

  private openBatchDetailsModal({ data }): void {
    this.modalService.show(BatchDetailsModalComponent, {
      class: 'batch-details-modal',
      initialState: {
        projectId: this.projectId,
        batchId: data.closingStatement.batchId,
        refreshParentGrid: this.refreshGrid.bind(this),
        documentId: data.id,
      },
    });
  }

  private subscribeToData(): void {
    this.gridLocalData$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((data: IGridLocalData) => {
        this.gridLocalData = data;
      });

    this.store.select(projectSelectors.closingStatementGridParams)
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(params => {
        this.closingStatementGridParams = params;
      });
  }

  getAllColumnDefs(): any {
    return [].concat(this.gridOptions.columnDefs);
  }

  private readonly exportOrder: string[] = [
    'Client ID',
    'Client Name',
    'Doc Name',
    'Doc ID',
    'Delivery Method',
    'Address',
    'City',
    'State',
    'Zip Code',
    'E-mail',
    'Tracking ID',
    'Created Date',
    'Created By',
  ];

  public exportClosingStatementList(columns: ColDef[]) {
    const columnsParam = columns.map(item => {
      const container: ColumnExport = {
        name: item.headerName,
        field: item.field,
      };

      if (container.field === 'closingStatement.address.address.line1') {
        container.field = 'closingStatement.address.address.lineOne';
      }

      if (container.field === 'closingStatement.address.address.zip') {
        container.field = 'closingStatement.address.address.zipCode';
      }

      return container;
    }).filter(column => column.name && column.field);
    columnsParam.sort((a, b) => this.exportOrder.indexOf(a.name) - this.exportOrder.indexOf(b.name));

    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }

    const channelName = StringHelper.generateChannelName(JobNameEnum.ExportClosingStatementList);

    this.channel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(ExportLoadingStatus).map(i => i.name),
      this.exportClosingStatementListCallback.bind(this),
      () => (this.store.dispatch(projectActions.DownloadClosingStatementList({
        id: this.projectId,
        searchOptions: this.getClosingStatementExportParams(),
        columns: columnsParam,
        channelName,
      }))),
    );
  }

  protected getClosingStatementExportParams(): ISearchOptions {
    const searchOptions = SearchOptionsHelper.createSearchOptions(this.gridLocalData, this.closingStatementGridParams);
    searchOptions.startRow = 0;
    searchOptions.endRow = -1;
    return searchOptions;
  }

  private exportClosingStatementListCallback(data, event): void {
    this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
    this.store.dispatch(projectActions.UpdateActionBar({ actionBar: this.actionBar }));

    switch ((<any>ExportLoadingStatus[event])) {
      case ExportLoadingStatus.Complete:
        this.store.dispatch(projectActions.DownloadDocument({ id: data.docId }));
        break;
      case ExportLoadingStatus.Error:
        this.store.dispatch(projectActions.Error({ error: `Error exporting: ${data.message}` }));
        break;
      default:
        break;
    }
  }

  public get hasSelectedRow() {
    if (this.gridLocalData?.selectedRecordsIds) {
      return [...this.gridLocalData.selectedRecordsIds.entries()]?.some(([, value]) => value === true);
    }
    return false;
  }

  public openVoidClosingStatemntDialogBox() {
    this.modalService.show(VoidClosingStatmentDialogModelComponent, {
      class: 'void-closing-statment-dialog-model',
      initialState: {
        isSelectAllclicked: this.gridLocalData?.isAllRowSelected,
        selectedRows: this.getSelectedDocIds,
        refreshParentGrid: () => this.refreshGrid(),
      },
    });
  }

  public get getSelectedDocIds(): any {
    if (this.gridLocalData?.selectedRecordsIds) {
      return [...this.gridLocalData.selectedRecordsIds.entries()]
        .filter(([, value]) => value === true)
        .map(([key]) => key);
    }
    return [];
  }

  public downloadCS(data) {
    this.store.dispatch(projectActions.GetClosingStatementDoc({ docId: data.id }));
  }

  public ngOnDestroy(): void {
    if (this.gridId === GridId.ProjectDisbursementClosingStatement) {
      this.store.dispatch(projectActions.UpdateActionBar({ actionBar: null }));
      this.store.dispatch(ClearSelectedRecordsState({ gridId: this.gridId }));
      this.ngUnsubscribe$.next();
      this.ngUnsubscribe$.complete();
    }
  }
}
