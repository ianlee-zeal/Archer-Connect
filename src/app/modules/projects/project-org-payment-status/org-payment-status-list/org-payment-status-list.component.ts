import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { first, takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { ColDef, GridOptions, ValueGetterParams } from 'ag-grid-community';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { EnumToArrayPipe, ExtendedCurrencyPipe } from '@app/modules/shared/_pipes';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ModalService, PermissionService } from '@app/services';
import { CheckboxEditorRendererComponent } from '@app/modules/shared/_renderers/checkbox-editor-renderer/checkbox-editor-renderer.component';
import { ColumnExport, IdValue } from '@app/models';
import * as fromShared from '@app/state';
import { EntityTypeEnum, ExportLoadingStatus, JobNameEnum, PermissionTypeEnum } from '@app/models/enums';
import * as rootActions from '@app/state/root.actions';
import { DisbursementDetailsModalComponent } from '@app/modules/disbursements/disbursement-details-modal/disbursement-details-modal.component';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PaymentQueueDataService } from '@app/modules/payment-queue/payment-queue-data.service';
import * as drodDownActions from '@app/modules/shared/state/drop-downs-values/actions';
import { StringHelper } from '@app/helpers/string.helper';
import * as exportsActions from '@app/modules/shared/state/exports/actions';
import { PusherService } from '@app/services/pusher.service';
import { ISearchOptions } from '@app/models/search-options';
import { SearchOptionsHelper } from '@app/helpers';
import { IGridLocalData } from '@app/state/root.state';
import { Observable } from 'rxjs';
import * as projectSelectors from '../../state/selectors';
import * as projectActions from '../../state/actions';

@Component({
  selector: 'app-org-payment-status-list',
  templateUrl: './org-payment-status-list.component.html',
  styleUrls: ['./org-payment-status-list.component.scss'],
})
export class OrgPaymentStatusListComponent extends ListView implements OnInit, OnDestroy, OnChanges {
  @Input() public projectId: number;
  @Input() public orgId: number | null;

  public readonly gridId: GridId = GridId.ProjectOrgPaymentStatusList;
  public gridLocalData$: Observable<IGridLocalData>;

  private gridLocalData: IGridLocalData;

  private isExporting: boolean = false;
  public bsModalRef: BsModalRef;
  public accountGroupsDropdownValues: IdValue[] = [];
  private readonly projectOrgsDropdownValues$ = this.store.select(projectSelectors.projectOrgsDropdownValues);
  public actionBar$ = this.store.select(projectSelectors.actionBar);
  public actionBar = {
    download: {
      disabled: () => this.isExporting || this.gridApi?.getDisplayedRowCount() === 0,
      options: [
        { name: 'Standard', callback: () => this.export(this.getAllColumnDefs()) },
      ],
    },
    exporting: { hidden: () => !this.isExporting },
    clearFilter: this.clearFilterAction(),
  };

  private readonly exportOrder: string[] = [
    'Account Group',
    'Account',
    'Assigned Org',
    'Total Amount',
    'Paid Amount',
    'Balance',
    'Entry Count',
    'Paid Entry',
  ];

  public readonly gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'Account Group',
        field: 'accountGroup',
        colId: 'accountGroupName',
        sortable: true,
        width: 190,
        minWidth: 190,
        ...AGGridHelper.getDropdownColumnFilter({ asyncOptions: this.paymentQueueDataService.ledgerAccountGroups$ }, 'agTextColumnFilter'),
      },
      {
        headerName: 'Account',
        field: 'account',
        colId: 'accountName',
        sortable: true,
        width: 250,
        minWidth: 250,
        cellRenderer: 'AccountRenderer',
        ...AGGridHelper.getDropdownColumnFilter({ asyncOptions: this.paymentQueueDataService.ledgerAccounts$ }, 'agTextColumnFilter'),
      },
      {
        headerName: 'Assigned Org',
        field: 'assignedOrg',
        sortable: true,
        ...AGGridHelper.nameColumnDefaultParams,
        ...AGGridHelper.getDropdownColumnFilter({ asyncOptions: this.projectOrgsDropdownValues$, filterByName: true }, 'agTextColumnFilter'),
      },
      {
        headerName: 'Total Amount',
        field: 'totalAmount',
        sortable: true,
        valueGetter: (params: ValueGetterParams): string => this.currencyPipe.transform(params.data.totalAmount),
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Paid Amount',
        field: 'paidAmount',
        sortable: true,
        valueGetter: (params: ValueGetterParams): string => this.currencyPipe.transform(params.data.paidAmount),
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Balance',
        field: 'balance',
        sortable: true,
        valueGetter: (params: ValueGetterParams): string => this.currencyPipe.transform(params.data.balance),
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Entry Count',
        field: 'entryCount',
        sortable: true,
        ...AGGridHelper.amountColumnDefaultParams,
      },
      {
        headerName: 'Paid Entry',
        field: 'paidCount',
        sortable: true,
        ...AGGridHelper.amountColumnDefaultParams,
      },
    ],
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    // onRowDoubleClicked: this.onRowDoubleClicked.bind(this), // removed until the requirements are clarified
    components: {
      activeRenderer: CheckboxEditorRendererComponent,
    },
  };

  constructor(
    private store: Store<fromShared.AppState>,
    protected router: Router,
    public modalService: ModalService,
    protected elementRef : ElementRef,
    private readonly currencyPipe: ExtendedCurrencyPipe,
    protected readonly paymentQueueDataService: PaymentQueueDataService,
    public permissionService: PermissionService,
    private readonly pusher: PusherService,
    private readonly enumToArray: EnumToArrayPipe,
  ) {
    super(router, elementRef);
  }
  ngOnChanges(_: SimpleChanges): void {
    this.fetchData(this.gridParams);
  }

  public ngOnInit(): void {
    this.store.dispatch(rootActions.GetStatuses({ entityType: EntityTypeEnum.PaymentRequest }));
    this.store.dispatch(projectActions.UpdateActionBar({ actionBar: this.actionBar }));

    this.actionBar$.pipe(first())
      .subscribe(
        actionBar => {
          this.store.dispatch(projectActions.UpdateActionBar({ ...actionBar, actionBar: this.actionBar }));
        },
      );

    if (this.projectId) {
      this.store.dispatch(drodDownActions.GetLedgerAccountGroups({ projectId: this.projectId }));
      this.store.dispatch(drodDownActions.GetLedgerAccounts({ projectId: this.projectId }));
      this.store.dispatch(projectActions.GetProjectOrgsDropdownValues({ projectId: this.projectId }));
      if (this.permissionService.canRead(PermissionTypeEnum.Organizations)) {
        this.store.dispatch(projectActions.GetProjectFirmsOptions({ projectId: this.projectId }));
      }
    }

    this.gridLocalData$ = this.store.select(fromShared.gridLocalDataByGridId({ gridId: this.gridId }));
    this.subscribeToData();
  }

  private subscribeToData(): void {
    this.gridLocalData$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((data: IGridLocalData) => {
        this.gridLocalData = data;
      });
  }

  public onView(data): void {
    this.showPaymentDetailsModal(data.paymentRequestId, data.isManual);
  }

  private showPaymentDetailsModal(paymentRequestId: number, isManual: boolean) {
    this.bsModalRef = this.modalService.show(DisbursementDetailsModalComponent, {
      initialState: { paymentRequestId, isManual },
      class: 'disbursement-details-modal',
    });
  }

  protected onRowDoubleClicked(row): void {
    this.onView(row.data.archerId);
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.gridParams = agGridParams;
    if (this.orgId && this.gridParams) {
      this.store.dispatch(projectActions.GetOrgPaymentStatusList({ projectId: this.projectId, orgId: this.orgId, agGridParams }));
    }
  }

  private export(columns: ColDef[]): void {
    const columnsParam = columns.map(item => {
      const container: ColumnExport = {
        name: item.headerName,
        field: item.field,
      };
      return container;
    }).filter(column => column.name && column.field);

    columnsParam.sort((a, b) => this.exportOrder.indexOf(a.name) - this.exportOrder.indexOf(b.name));

    this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));

    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }

    const channelName = StringHelper.generateChannelName(JobNameEnum.ExportProjectOrgPaymentStatus, this.projectId, EntityTypeEnum.Projects);

    this.channel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(ExportLoadingStatus).map(i => i.name),
      this.exportCallback.bind(this),
      () => (this.store.dispatch(projectActions.DownloadOrgPaymentStatus({
        projectId: this.projectId,
        orgId: this.orgId,
        channelName,
        columns: columnsParam,
        searchOptions: this.getStandardExportParams(),
      }))),
    );
  }

  private getStandardExportParams(): ISearchOptions {
    const searchOptions = SearchOptionsHelper.createSearchOptions(this.gridLocalData, this.gridParams);
    searchOptions.startRow = 0;
    searchOptions.endRow = -1;
    return searchOptions;
  }

  private exportCallback(data, event): void {
    switch ((<any>ExportLoadingStatus[event])) {
      case ExportLoadingStatus.Complete:
        this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
        this.store.dispatch(projectActions.DownloadDocument({ id: data.docId }));
        this.store.dispatch(projectActions.UpdateActionBar({ actionBar: this.actionBar }));
        break;
      case ExportLoadingStatus.Error:
        this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
        this.store.dispatch(projectActions.Error({ error: data.message }));
        this.store.dispatch(projectActions.UpdateActionBar({ actionBar: this.actionBar }));
        break;
      default:
        break;
    }
  }

  getAllColumnDefs(): ColDef[] {
    return [].concat(this.gridOptions.columnDefs);
  }

  public ngOnDestroy(): void {
    this.store.dispatch(projectActions.UpdateActionBar({ actionBar: null }));
    this.store.dispatch(rootActions.ClearGridLocalData({ gridId: this.gridId }));

    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
