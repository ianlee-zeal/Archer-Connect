import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { GridApi, GridOptions } from 'ag-grid-community';
import { Store } from '@ngrx/store';

import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { AppState } from '@app/modules/projects/state';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { CurrencyHelper, StringHelper } from '@app/helpers';
import { DateFormatPipe, EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { PusherService } from '@app/services/pusher.service';
import { exportsSelectors } from '@app/modules/shared/state/exports/selectors';
import * as exportsActions from '@app/modules/shared/state/exports/actions';
import { takeUntil } from 'rxjs/operators';
import { LogService } from '@app/services/log-service';
import { ExportLoadingStatus, JobNameEnum } from '@app/models/enums';
import { IExportRequest } from '@app/models/export-request';
import * as commonSharedActions from 'src/app/modules/shared/state/index';
import { ColumnExport } from '@app/models';
import cloneDeep from 'lodash-es/cloneDeep';
import * as projectActions from '../../projects/state/actions';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum'
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { FilterModel } from '@app/models/advanced-search/filter-model';

@Component({
  selector: 'app-accounting-invoice-items',
  templateUrl: './accounting-invoice-items.component.html',
})
export class AccountingInvoiceItemsComponent extends ListView {
  public readonly gridId = GridId.AccountingInvoiceItems;
  private isExporting: boolean;
  public readonly actionBar$ = this.store.select(selectors.actionBar);

  private actionBar: ActionHandlersMap = {
    clearFilter: this.clearFilterAction(),
    actions: {
      options: [
        {
          name: 'Export Billable Items',
          disabled: () => this.isExporting,
          callback: () => this.standardExportBillableItemsList(),
        },
      ],
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
        headerName: 'Project ID',
        field: 'case.id',
        width: 50,
        maxWidth: 110,
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter({
          onlyNumbers: true,
          isAutofocused: true,
        }),
      },
      {
        headerName: 'Project Name',
        field: 'case.name',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        maxWidth: 180,
      },
      {
        headerName: 'Fee ID',
        field: 'id',
        width: 50,
        maxWidth: 110,
        sortable: true,
        sort: 'desc',
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter({
          onlyNumbers: true,
        }),
      },
      {
        headerName: 'Contract Rule',
        field: 'billingRule.name',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        minWidth: 220,
        width: 220,
      },
      {
        headerName: 'Claimant Name',
        field: 'client.fullName',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
        maxWidth: 180,
      },
      {
        headerName: 'Price',
        field: 'calculatedAmount',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        ...AGGridHelper.amountColumnDefaultParams,
        cellRenderer: CurrencyHelper.toUsdFormat,
      },
      {
        headerName: 'Stage',
        field: 'invoiceStage',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Invoiced Amount',
        field: 'invoiceAmount',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        ...AGGridHelper.amountColumnDefaultParams,
        cellRenderer: CurrencyHelper.toUsdFormat,
      },
      {
        headerName: 'Invoice Number',
        field: 'invoiceNumber',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter(),
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        headerName: 'Invoice Date',
        field: 'invoicedDate',
        sortable: true,
        resizable: true,
        ...AGGridHelper.dateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
        cellRenderer: data => this.datePipe.transform(data.value, false, null, null, null, true),
      },
      {
        headerName: 'Paid Amount',
        field: 'paidAmount',
        sortable: true,
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter({ isDecimal: true }),
        ...AGGridHelper.amountColumnDefaultParams,
        cellRenderer: CurrencyHelper.toUsdFormat,
      },
      {
        headerName: 'Paid Date',
        field: 'paidDate',
        sortable: true,
        resizable: true,
        ...AGGridHelper.dateColumnDefaultParams,
        ...AGGridHelper.dateColumnFilter(),
        cellRenderer: data => this.datePipe.transform(data.value, false, null, null, null, true),
      },
    ],
    components: { },
  };

  constructor(
    private readonly store: Store<AppState>,
    protected readonly router: Router,
    protected readonly elementRef: ElementRef,
    private readonly datePipe: DateFormatPipe,
    private readonly pusher: PusherService,
    private readonly enumToArray: EnumToArrayPipe,
    private readonly logger: LogService,
  ) {
    super(router, elementRef);
  }

  public ngOnInit(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: this.actionBar }));
    this.subscribeToExport();
  }

  protected fetchData(params: IServerSideGetRowsParamsExtended): void {
    this.gridParams = params;
    this.store.dispatch(projectActions.SearchInvoiceItems({ agGridParams: params }));
  }

  public gridReady(gridApi: GridApi): void {
    super.gridReady(gridApi);

    if (this.gridParams) {
      this.gridApi.setFilterModel(this.gridParams.request.filterModel);
    }
  }

  public ngOnDestroy(): void {
    this.store.dispatch(projectActions.UpdateActionBar({ actionBar: null }));
    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }
    super.ngOnDestroy();
  }

  private subscribeToExport(): void {
    this.store.select(exportsSelectors.isExporting)
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(result => { this.isExporting = result; });
  }

  standardExportBillableItemsList(): void {
    this.store.dispatch(exportsActions.SetExportStatus({ isExporting: true }));

    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }

    const channelName = StringHelper.generateChannelName(JobNameEnum.ExportFees);

    this.channel = this.pusher.subscribeChannel(
      channelName,
      this.enumToArray.transform(ExportLoadingStatus).map(i => i.name),
      this.exportCallback.bind(this),
      () => {
        const exportRequest: IExportRequest = {
          name: 'Fees List',
          channelName,
          columns: this.getExportColumns(),
          searchOptions: this.getExportBillableItemsSearchParam(),
        };
        this.store.dispatch(projectActions.ExportInvoiceItems({ exportRequest }));
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
        this.store.dispatch(projectActions.Error({ error: data.message }));
        this.store.dispatch(exportsActions.SetExportStatus({ isExporting: false }));
        break;
      default:
        break;
    }
  }

  private getExportColumns(): ColumnExport[] {
    const columns: ColumnExport[] = [
      { name: 'Fee ID', field: 'id' },
      { name: 'Project ID', field: 'caseId' },
      { name: 'Project Name', field: 'case.name' },
      { name: 'Client ID', field: 'clientId' },
      { name: 'RelatedEntityType', field: 'relatedEntityType.name' },
      { name: 'EntityId', field: 'relatedEntityId' },
      { name: 'Contract Rule ID', field: 'billingRuleId' },
      { name: 'Contract Rule Name', field: 'billingRule.name' },
      { name: 'Fee Scope', field: 'billingRule.feeScope.name' },
      { name: 'ClientLastName', field: 'client.lastName' },
      { name: 'ClientFirstName', field: 'client.firstName' },
      { name: 'InvoiceStage', field: 'invoiceStage' },
      { name: 'Price', field: 'calculatedAmount' },
      { name: 'Invoiced Amount', field: 'invoiceAmount' },
      { name: 'Paid Amount', field: 'paidAmount' },
    ];

    return columns;
  }

  private getExportBillableItemsSearchParam(): IServerSideGetRowsRequestExtended {
    const searchParams: IServerSideGetRowsRequestExtended = cloneDeep(this.getExportParams().request);
    searchParams.filterModel.push(new FilterModel({
      filter: 'Billable',
      filterType: FilterTypes.Text,
      type: 'equals',
      key: 'invoiceStage',
    }));
    return searchParams;
  }
}
