import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { GridApi, GridOptions } from 'ag-grid-community';
import { Store } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { AppState } from '@app/modules/projects/state';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { first, takeUntil } from 'rxjs/operators';
import { CurrencyHelper, StringHelper } from '@app/helpers';
import { DateFormatPipe, EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import { EntityTypeEnum, ExportLoadingStatus, JobNameEnum, StatusEnum } from '@app/models/enums';
import { FinancialProcessorRun } from '@app/models/financial-processor-run';
import * as documentActions from '@app/modules/shared/state/documents-list/actions';
import { PusherService } from '@app/services/pusher.service';
import { Channel } from 'pusher-js';
import { ColumnExport } from '@app/models';
import { IExportRequest } from '@app/models/export-request';
import { LogService } from '@app/services/log-service';
import * as exportsActions from '@app/modules/shared/state/exports/actions';
import { exportsSelectors } from '@shared/state/exports/selectors';
import * as commonSharedActions from 'src/app/modules/shared/state/index';
import cloneDeep from 'lodash-es/cloneDeep';
import * as projectSelectors from '../../state/selectors';
import * as projectActions from '../../state/actions';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { FilterModel } from '@app/models/advanced-search/filter-model';

@Component({
  selector: 'app-invoice-items-grid',
  templateUrl: './invoice-items-grid.component.html',
})
export class InvoiceItemsGridComponent extends ListView {
  public readonly gridId = GridId.InvoiceItems;
  private pusherChannel: Channel;
  private currentProjectId: number;
  private financialProcessorLatestRunForCurrentProject: FinancialProcessorRun;
  private isProcessing: boolean = false;
  private isExporting: boolean;

  private actionBarActionHandlers: ActionHandlersMap = {
    clearFilter: this.clearFilterAction(),
    actions: {
      options: [
        {
          name: 'Run Financial Processor',
          disabled: () => !this.currentProjectId,
          callback: this.onRunFinancialProcessor.bind(this),
        },
        {
          name: 'Download Log',
          callback: this.onDownloadLog.bind(this),
          disabled: () => !this.currentProjectId || !this.financialProcessorLatestRunForCurrentProject,
        },
      ],
    },
    download: {
      disabled: () => this.isExporting,
      options: [
        { name: 'Standard', callback: () => this.standardExportFeesList() },
      ],
    },
    processing: { hidden: () => !this.isProcessing },
  };

  public gridOptions: GridOptions = {
    ...AGGridHelper.defaultGridOptions,
    columnDefs: [
      {
        headerName: 'ID',
        field: 'id',
        width: 50,
        maxWidth: 110,
        sortable: true,
        sort: 'desc',
        resizable: true,
        ...AGGridHelper.getCustomTextColumnFilter({
          onlyNumbers: true,
          isAutofocused: true,
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
    defaultColDef: {
      ...AGGridHelper.defaultGridOptions.defaultColDef,
      floatingFilter: true,
    },
    components: { },
  };

  private readonly project$ = this.store.select(projectSelectors.item);
  private readonly financialProcessorLatestRun$ = this.store.select(projectSelectors.financialProcessorLatestRun);

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
    this.store.dispatch(projectActions.UpdateActionBar({ actionBar: this.actionBarActionHandlers }));
    this.subscribeToCurrentProject();
    this.subscribeToFinancialProcessorRun();
    this.subscribeToExport();
  }

  protected fetchData(params: IServerSideGetRowsParamsExtended): void {
    this.gridParams = params;

    if (this.currentProjectId) {
      this.addProjectIdFilterIntoSearchParams(this.currentProjectId, params);
      this.store.dispatch(projectActions.SearchInvoiceItems({ agGridParams: params }));
    } else {
      this.waitForCurrentProjectIdThenFetchGrid(params);
    }
  }

  public gridReady(gridApi: GridApi): void {
    super.gridReady(gridApi);

    if (this.gridParams) {
      this.gridApi.setFilterModel(this.gridParams.request.filterModel);
    }
  }

  private onDownloadLog(): void {
    this.store.dispatch(
      documentActions.DownloadDocument({ id: this.financialProcessorLatestRunForCurrentProject.evaluationResultDocId }),
    );
  }

  private onRunFinancialProcessor(): void {
    const channelName = StringHelper.generateChannelName(JobNameEnum.RunFinancialProcessor, this.currentProjectId, EntityTypeEnum.Projects);

    if (this.pusherChannel) {
      this.pusher.unsubscribeChannel(this.pusherChannel);
    }

    this.isProcessing = true;

    this.pusherChannel = this.pusher.subscribeChannel(
      channelName,
      [StatusEnum.Complete.toString(), StatusEnum.Error.toString()],
      this.runFinancialProcessorEventsHandler.bind(this),
      () => this.store.dispatch(projectActions.StartFinancialProcessorForProject({
        projectId: this.currentProjectId,
        pusherChannelName: channelName,
      })),
    );
  }

  private runFinancialProcessorEventsHandler(data: any, event: string): void {
    if (event === StatusEnum.Complete.toString()) {
      this.isProcessing = false;

      this.dispatchGetFinancialProcessorLatestRun();

      if (data.ResultDocId) {
        this.store.dispatch(documentActions.DownloadDocument({ id: data.ResultDocId }));
      }
    }
  }

  private subscribeToCurrentProject() {
    this.project$.pipe(
      first(p => !!p),
    ).subscribe(p => {
      this.currentProjectId = p.id;
      this.dispatchGetFinancialProcessorLatestRun();
    });
  }

  private dispatchGetFinancialProcessorLatestRun(): void {
    this.store.dispatch(projectActions.GetFinancialProcessorLatestRun({
      entityType: EntityTypeEnum.Projects,
      entityId: this.currentProjectId,
    }));
  }

  private subscribeToFinancialProcessorRun() {
    this.financialProcessorLatestRun$.pipe(
      first(latestRun => latestRun && latestRun.entityId === this.currentProjectId),
    ).subscribe(r => {
      this.financialProcessorLatestRunForCurrentProject = r;
    });
  }

  private subscribeToExport(): void {
    this.store.select(exportsSelectors.isExporting)
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(result => { this.isExporting = result; });
  }

  private addProjectIdFilterIntoSearchParams(projectId: number, params: IServerSideGetRowsParamsExtended): void {
    params.request.filterModel.push(new FilterModel({
      filter: projectId,
      filterType: FilterTypes.Number,
      key: 'caseId',
      type: 'equals',
    }));
  }

  private waitForCurrentProjectIdThenFetchGrid(params: IServerSideGetRowsParamsExtended): void {
    this.project$.pipe(
      first(p => !!p),
    ).subscribe(p => {
      this.addProjectIdFilterIntoSearchParams(p.id, params);
      this.store.dispatch(projectActions.SearchInvoiceItems({ agGridParams: params }));
    });
  }

  standardExportFeesList(): void {
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
          searchOptions: this.getExportSearchParam(),
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

  private getExportSearchParam(): IServerSideGetRowsRequestExtended {
    const searchParams: IServerSideGetRowsRequestExtended = cloneDeep(this.getExportParams().request);
    return searchParams;
  }

  public ngOnDestroy(): void {
    if (this.pusherChannel) {
      this.pusher.unsubscribeChannel(this.pusherChannel);
    }
    if (this.channel) {
      this.pusher.unsubscribeChannel(this.channel);
    }

    this.store.dispatch(projectActions.UpdateActionBar({ actionBar: null }));
    super.ngOnDestroy();
  }
}
