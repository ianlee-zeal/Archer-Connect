import { Component, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AGGridHelper, CurrencyHelper, SearchOptionsHelper, StringHelper } from '@app/helpers';
import { EntityTypeEnum, ExportLoadingStatus, ExportName, GridId, JobNameEnum } from '@app/models/enums';
import { QSFSweepBatch } from '@app/models/qsf-sweep/qsf-sweep-batch';
import { StatusRendererComponent } from '@app/modules/projects/project-disbursement-claimant-summary/renderers/status-renderer/status-renderer.component';
import * as projectActions from '@app/modules/projects/state/actions';
import * as qsfSweepActions from '@app/modules/qsf-sweep/state/actions';
import * as qsfSweepSelectors from '@app/modules/qsf-sweep/state/selectors';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { DateFormatPipe, EnumToArrayPipe, YesNoPipe } from '@app/modules/shared/_pipes';
import { GridHeaderCheckboxComponent } from '@app/modules/shared/grid/grid-header-checkbox/grid-header-checkbox.component';
import { ModalService } from '@app/services';
import * as fromShared from '@app/state';
import { ActionsSubject, Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import * as exportsActions from '@shared/state/exports/actions';
import { ColDef, GridOptions, ICellRendererParams, RowDoubleClickedEvent } from 'ag-grid-community';
import * as rootActions from '@app/state/root.actions';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import * as rootSelectors from '@app/state/';
import { IdValue } from '@app/models/idValue';
import { ISearchOptions } from '@app/models/search-options';
import { IGridLocalData } from '@app/state/root.state';
import { Observable } from 'rxjs/internal/Observable';
import { PusherService } from '@app/services/pusher.service';
import { ColumnExport } from '@app/models';
import { IExportRequest } from '@app/models/export-request';
import { exportsSelectors } from '@app/modules/shared/state/exports/selectors';
import { ofType } from '@ngrx/effects';
import { QsfSweepCommitChangesModalComponent } from '../qsf-sweep-commit-changes-modal/qsf-sweep-commit-changes-modal.component.ts';

@Component({
  selector: 'app-qsf-sweep-result-list',
  templateUrl: './qsf-sweep-result-list.component.html',
  styleUrls: ['./qsf-sweep-result-list.component.scss'],
})
export class QsfSweepResultListComponent extends ListView {
  private gridLocalData: IGridLocalData;
  public gridLocalData$: Observable<any>;

  public isExporting = false;
  public caseId: number;
  public batchId: number;
  public availableForCommit: boolean;
  public gridId: GridId = GridId.QSFSweepBatchResultList;
  public readonly qsfBatch$ = this.store.select(qsfSweepSelectors.qsfSweepBatch);
  public type = 'error';
  public text = 'BATCH CLOSED';
  private readonly statuses$ = this.store.select<IdValue[]>(rootSelectors.statusesByEntityType({ entityType: EntityTypeEnum.QSFSweepResults }));

  public gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
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
        headerName: 'Client ID',
        field: 'clientId',
        width: 100,
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'First Name',
        field: 'firstName',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Last Name',
        field: 'lastName',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Lien Outcome',
        field: 'financialOutcome',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Fee Outcome',
        field: 'feeOutcome',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Skip Liens Count',
        field: 'skipLienCount',
        sortable: true,
        ...AGGridHelper.numberColumnDefaultParams,
        minWidth: 120,
        width: 120,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
      },
      {
        headerName: 'Skip Fees Count',
        field: 'skipFeesCount',
        sortable: true,
        ...AGGridHelper.numberColumnDefaultParams,
        minWidth: 120,
        width: 120,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
      },
      {
        headerName: 'Status',
        field: 'status',
        colId: 'statusId',
        sortable: false,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getDropdownColumnFilter({ asyncOptions: this.statuses$ }),
      },
      {
        headerName: 'DG Count',
        field: 'dgCount',
        sortable: true,
        ...AGGridHelper.numberColumnDefaultParams,
        minWidth: 80,
        width: 80,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
      },
      {
        headerName: 'Open DG Count',
        field: 'dgOpenCount',
        sortable: true,
        ...AGGridHelper.numberColumnDefaultParams,
        minWidth: 120,
        width: 120,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
      },
      {
        headerName: 'Edit DG Name',
        field: 'dgEdited',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        minWidth: 120,
        width: 120,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Category',
        field: 'categoryCode',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        minWidth: 80,
        width: 80,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Ledger Lien Status',
        field: 'ledgerLienStatus',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        minWidth: 130,
        width: 130,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'LPM Lien Status',
        field: 'lpmLienStatus',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        minWidth: 120,
        width: 120,
        ...AGGridHelper.getCustomTextColumnFilter(),
      },
      {
        headerName: 'Delta Settlement',
        headerTooltip: 'Delta Settlement',
        field: 'deltaLiensOnlySettlementAmount',
        sortable: true,
        ...AGGridHelper.amountColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        cellRenderer: CurrencyHelper.toUsdFormat,
      },
      {
        headerName: 'Delta Holdback',
        headerTooltip: 'Delta Holdback',
        field: 'deltaLienHoldbackAmount',
        sortable: true,
        ...AGGridHelper.amountColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        cellRenderer: CurrencyHelper.toUsdFormat,
      },
      {
        headerName: 'Delta Final Liens',
        headerTooltip: 'Delta Final Liens',
        field: 'deltaFinalLienAmount',
        sortable: true,
        ...AGGridHelper.amountColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        cellRenderer: CurrencyHelper.toUsdFormat,
      },
      {
        headerName: 'Delta Lien Fees',
        headerTooltip: 'Delta Lien Fees',
        field: 'deltaLienFeeAmount',
        sortable: true,
        ...AGGridHelper.amountColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        cellRenderer: CurrencyHelper.toUsdFormat,
      },
      {
        headerName: 'Delta Other Fees',
        headerTooltip: 'Delta Other Fees',
        field: 'deltaOtherFeesAmount',
        sortable: true,
        ...AGGridHelper.amountColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        cellRenderer: CurrencyHelper.toUsdFormat,
      },
      {
        headerName: 'Delta Total Fees',
        headerTooltip: 'Delta Total Fees',
        field: 'deltaTotalFeesAmount',
        sortable: true,
        ...AGGridHelper.amountColumnDefaultParams,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        cellRenderer: CurrencyHelper.toUsdFormat,
      },
      {
        headerName: 'BK',
        field: 'bankruptcy',
        sortable: false,
        cellRenderer: 'statusRenderer',
        ...AGGridHelper.tagColumnDefaultParams,
        width: 120,
        minWidth: 120,
      },
      {
        headerName: 'Probate',
        field: 'probate',
        sortable: false,
        cellRenderer: 'statusRenderer',
        ...AGGridHelper.tagColumnDefaultParams,
        width: 120,
        minWidth: 120,
      },
      {
        headerName: 'Error',
        field: 'error',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Processed Lien Date',
        field: 'processedDate',
        sortable: true,
        cellRenderer: (data: ICellRendererParams): string => this.datePipe.transform(data.value, false, null, null, true),
        ...AGGridHelper.dateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
        width: 140,
        minWidth: 140,
      },
      {
        headerName: 'Processed Fee Date',
        field: 'processedFeeDate',
        sortable: true,
        cellRenderer: (data: ICellRendererParams): string => this.datePipe.transform(data.value, false, null, null, true),
        ...AGGridHelper.dateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
        width: 150,
        minWidth: 150,
      },

    ],
    suppressRowClickSelection: true,
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
    components: {
      statusRenderer: StatusRendererComponent,
    },
  };

  constructor(
    protected readonly router: Router,
    protected readonly elementRef: ElementRef,
    private readonly route: ActivatedRoute,
    private readonly yesNoPipe: YesNoPipe,
    private readonly modalService: ModalService,
    private readonly store: Store<fromShared.AppState>,
    private readonly pusher: PusherService,
    private readonly enumToArray: EnumToArrayPipe,
    protected readonly datePipe: DateFormatPipe,
    private actionsSubj: ActionsSubject,
  ) {
    super(router, elementRef);
  }

  ngOnInit(): void {
    this.gridLocalData$ = this.store.select(fromShared.gridLocalDataByGridId({ gridId: this.gridId }));
    this.gridLocalData$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((data: IGridLocalData) => {
        this.gridLocalData = data;
      });

    this.store.select(exportsSelectors.isExporting).pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(result => { this.isExporting = result; });

    this.store.dispatch(qsfSweepActions.GetQsfSweepBatchByIdRequest({ batchId: this.route.snapshot.params.id }));
    this.updateActionBar();
    this.store.dispatch(rootActions.GetStatuses({ entityType: EntityTypeEnum.QSFSweepResults }));
    this.qsfBatch$.subscribe((qsfSweepBatch: QSFSweepBatch) => {
      this.caseId = qsfSweepBatch?.caseId;
      this.availableForCommit = qsfSweepBatch?.availableForCommit;
      this.batchId = qsfSweepBatch?.id;
    });

    this.actionsSubj.pipe(
      ofType(qsfSweepActions.QsfSweepCommitChangesSuccess),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => {
      this.gridApi.refreshServerSide({ purge: true });
    });
  }

  protected updateActionBar(): void {
    this.store.dispatch(projectActions.UpdateActionBar({ actionBar: {
      commitChanges: {
        disabled: () => !this.availableForCommit,
        callback: () => { this.commitChanges(); },
      },
      download: {
        disabled: () => this.isExporting,
        options: [
          { name: 'Standard', callback: () => this.exportList(this.getAllColumnDefs()) },
        ],
      },
      exporting: { hidden: () => !this.isExporting },
    } }));
  }

  protected commitChanges(): void {
    this.modalService.show(QsfSweepCommitChangesModalComponent, {
      class: 'qsf-sweep-commit-changes-modal',
      initialState: {
        caseId: this.caseId,
        batchId: this.route.snapshot.params.id,
        selectedClaimantsIds: this.gridApi.getSelectedRows().map((row: any) => row.clientId),
        isAllClaimantsSelected: this.gridLocalData.isAllRowSelected,
      },
    });
  }

  protected fetchData(params: IServerSideGetRowsParamsExtended): void {
    this.store.dispatch(qsfSweepActions.GetQsfSweepBatchResultListRequest({ batchId: this.route.snapshot.params.id, gridParams: params }));
  }

  getAllColumnDefs(): any {
    return [].concat(this.gridOptions.columnDefs);
  }

  private exportList(columns: ColDef[]): void {
    const columnsParam = columns.map(item => {
      const container: ColumnExport = {
        name: item.headerName,
        field: item.field,
      };
      return container;
    }).filter(column => column.name && column.field);

    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }

    const channelName = StringHelper.generateChannelName(JobNameEnum.ExportClosingStatementList);

    const exportRequest: IExportRequest = {
      name: ExportName[ExportName.QSFSweepBatchResult],
      channelName,
      columns: columnsParam,
      searchOptions: this.getQSFSweepResultListExportParams(),
    };

    this.channel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(ExportLoadingStatus).map(i => i.name),
      this.exportQSFSweepResultListCallback.bind(this),
      () => (this.store.dispatch(qsfSweepActions.DownloadQSFSweepResultList({batchId: this.batchId, exportRequest }))),
    );
  }

  protected getQSFSweepResultListExportParams(): ISearchOptions {
    const searchOptions = SearchOptionsHelper.createSearchOptions(this.gridLocalData, this.gridParams);
    searchOptions.startRow = 0;
    searchOptions.endRow = -1;
    return searchOptions;
  }

  private exportQSFSweepResultListCallback(data: any, event: string): void {
    this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
    this.updateActionBar();

    switch ((ExportLoadingStatus[event])) {
      case ExportLoadingStatus.Complete:
        this.store.dispatch(qsfSweepActions.DownloadDocument({ id: data.docId }));
        break;
      case ExportLoadingStatus.Error:
        this.store.dispatch(qsfSweepActions.Error({ errorMessage: `Error exporting: ${data.message}` }));
        break;
      default:
        break;
    }
  }

  private onRowDoubleClicked(row: RowDoubleClickedEvent): void {
    if (row.data.clientId) {
      window.open(`${location.origin}/claimants/${row.data.clientId}/payments/tabs/ledger-summary`, "_blank");
    }
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
    this.store.dispatch(projectActions.UpdateActionBar({ actionBar: null }));
  }
}
