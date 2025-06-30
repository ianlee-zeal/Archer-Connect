import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AGGridHelper } from '@app/helpers';
import { GridId } from '@app/models/enums';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { DateFormatPipe, EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { GridOptions, ICellRendererParams, RowNode } from 'ag-grid-community';
import { Store } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { AppState } from '@app/state';
import * as qsfSweepActions from '@app/modules/qsf-sweep/state/actions';
import * as projectSelectors from '@app/modules/projects/state/selectors';
import * as projectActions from '@app/modules/projects/state/actions';
import { QSFLienSweepStatus } from '@app/models/enums/qsf-lien-sweep-status.enum';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { QSFSweepBatch } from '@app/models/qsf-sweep/qsf-sweep-batch';
import { IdValue } from '@app/models';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { takeUntil } from 'rxjs/operators';
import { QSFSweepBatchPusher } from '@app/models/qsf-sweep/qsf-sweep-batch-pusher';
import { QsfSweepHelperService } from '../services/qsf-sweep-helper.service';
import { QsfSweepBatchActionsRendererComponent } from './qsf-sweep-batch-actions-renderer/qsf-sweep-batch-actions-renderer.component';

@Component({
  selector: 'app-qsf-sweep-batch-list',
  templateUrl: './qsf-sweep-batch-list.component.html',
  styleUrls: ['./qsf-sweep-batch-list.component.scss'],
})
export class QsfSweepBatchListComponent extends ListView {
  public gridId: GridId = GridId.QSFSweepBatchList;

  public readonly project$ = this.store.select(projectSelectors.item);
  public statusEnumOptions: SelectOption[] = this.enumToArrayPipe.transform(QSFLienSweepStatus).sort((prev: IdValue, current: IdValue) => ((prev.name > current.name) ? 1 : -1));

  public readonly actionBar$ = this.store.select(projectSelectors.actionBar);

  private actionBar: ActionHandlersMap = {
    clearFilter: this.clearFilterAction(),
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
        width: 100,
        sortable: true,
        sort: 'desc',
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        ...AGGridHelper.fixedColumnDefaultParams,
      },
      {
        headerName: 'Status',
        field: 'statusId',
        sortable: true,
        cellRenderer: (data: ICellRendererParams): string => (data.value != null ? this.statusEnumOptions.find((type: SelectOption) => type.id === data.value)?.name : ''),
        ...AGGridHelper.getDropdownColumnFilter({ options: this.statusEnumOptions }),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Created By',
        field: 'createdBy.displayName',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.lastModifiedByColumnDefaultParams,
      },
      {
        headerName: 'Created Date',
        field: 'createdDate',
        sortable: true,
        cellRenderer: (data: ICellRendererParams): string => this.datePipe.transform(data.value, false, null, null, true),
        ...AGGridHelper.lastModifiedDateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
      },
      {
        headerName: '# of Claimants',
        field: 'countOfClaimants',
        colId: 'QSFSweepBatchResults.Count',
        sortable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ onlyNumbers: true }),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        field: 'reportDocId',
        hide: true,
      },
      AGGridHelper.getActionsColumn({
        downloadFilesHandler: this.downloadFile.bind(this),
        openResultDetailsHandler: this.openResultDetails.bind(this),
      }),
    ],
    suppressRowClickSelection: true,
    onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
    components: { buttonRenderer: QsfSweepBatchActionsRendererComponent },
  };

  constructor(
    private readonly datePipe: DateFormatPipe,
    protected readonly router: Router,
    protected readonly elementRef: ElementRef,
    private readonly store: Store<AppState>,
    private readonly enumToArrayPipe: EnumToArrayPipe,
    private readonly qsfSweepHelperService: QsfSweepHelperService,
  ) {
    super(router, elementRef);
  }

  public ngOnDestroy(): void {
    this.store.dispatch(projectActions.UpdateActionBar({ actionBar: null }));
    super.ngOnDestroy();
  }

  ngOnInit(): void {
    this.subscribeToCurrentBatchFromPusher();
    this.store.dispatch(projectActions.UpdateActionBar({ actionBar: this.actionBar }));
  }

  protected fetchData(params: IServerSideGetRowsParamsExtended): void {
    this.store.dispatch(qsfSweepActions.GetQsfSweepBatchListRequest({ gridParams: params }));
  }

  private downloadFile(data: QSFSweepBatch): void {
    this.store.dispatch(qsfSweepActions.DownloadDocument({ id: data.reportDocId }));
  }

  private openResultDetails(data: QSFSweepBatch): void {
    this.store.dispatch(qsfSweepActions.GotoResultDetailsPage({ batchId: data.id }));
  }

  private onRowDoubleClicked(row): void {
    if (!row) {
      return;
    }
    this.openResultDetails(row.data);
  }

  private subscribeToCurrentBatchFromPusher(): void {
    this.qsfSweepHelperService.getCurrentBatchEmitter().pipe(takeUntil(this.ngUnsubscribe$)).subscribe((data: QSFSweepBatchPusher) => {
      if (!this.gridApi) {
        return;
      }
      this.gridApi.forEachNode((rowNode: RowNode) => {
        if (!!rowNode.data && !!rowNode.data.id && data.Id === rowNode.data.id) {
          rowNode.setDataValue('statusId', data.StatusId);
          rowNode.setDataValue('reportDocId', data.ReportDocId);
          rowNode.setDataValue('countOfClaimants', data.CountOfClaimants);
          this.gridApi.flashCells({ rowNodes: [rowNode], columns: ['statusId', 'actions', 'countOfClaimants'] });
        }
      });
    });
  }
}
