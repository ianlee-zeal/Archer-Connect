import { Component, ElementRef, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CurrencyHelper, AGGridHelper } from '@app/helpers';
import { DocumentImport } from '@app/models/documents';
import { FileImportDocumentType, GridId, FileImportResultStatus, FileImportReviewTabs, PaymentMethodEnum } from '@app/models/enums';
import { ValidationResultsLineItem } from '@app/models/file-imports';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { SplitCamelCasePipe } from '@app/modules/shared/_pipes';
import { sharedActions } from '@app/modules/shared/state';
import { Store } from '@ngrx/store';
import { GridOptions, CellClassParams, ValueGetterParams } from 'ag-grid-community';
import * as fromShared from '@app/modules/shared/state';

@Component({
  selector: 'app-payments-all-records',
  templateUrl: './payments-all-records.component.html',
})
export class PaymentsAllRecordsComponent extends ListView {
  @Input() public documentImport: DocumentImport;
  @Input() public documentTypeId: FileImportDocumentType;

  public gridId: GridId = GridId.ManualPaymentsReviewAllRecords;

  constructor(
    private store: Store<fromShared.AppState>,
    protected router: Router,
    protected elementRef: ElementRef,
    private splitCamelCase: SplitCamelCasePipe,
  ) {
    super(router, elementRef);
  }

  public gridOptions: GridOptions = {
    columnDefs: [
      { field: 'description', headerName: 'Name', width: 150 },
      {
        field: 'importResultStatus',
        headerName: 'Summary',
        width: 120,
        cellClass: (params: CellClassParams) => this.getSummaryClass((params.data as ValidationResultsLineItem)),
        valueGetter: params => params.data.value,
      },
    ],
    animateRows: false,
    defaultColDef: {
      suppressMenu: true,
      autoHeight: true,
      wrapText: true,
      sortable: false,
    },
  };

  private getSummaryClass(item: ValidationResultsLineItem): string {
    let cellClass = '';

    if (!item.valid) {
      cellClass = 'ag-cell-error-sign';
    }

    if (item.valid && item.errorList.length) {
      cellClass = 'ag-cell-warning-sign';
    }

    if (item.valid && !item.errorList.length) {
      cellClass = 'ag-cell-success-sign';
    }

    if (item.hasDeleted) {
      cellClass += ' ag-cell-deleted-sign';
    }

    return cellClass;
  }

  public ngOnInit() {
      const resultTab = this.documentTypeId === FileImportDocumentType.LoadingResults;
      this.gridOptions.columnDefs = [
        { field: 'rowNo', headerName: 'Row Id', width: 60, hide: resultTab },
        { field: 'fields.RequestId', headerName: 'Request Id', width: 60, hide: !resultTab },
        { field: 'fields.Payee', headerName: 'Payee', width: 120,  hide: !resultTab },
        {
          headerName: 'Payee Id',
          width: 60,
          valueGetter: (params: ValueGetterParams) => params.data.fields.OrganizationId ?? params.data.fields.ClientId,
          hide: resultTab,
        },
        {
          field: 'fields.PayeeId',
          headerName: 'Payee Id',
          width: 60,
          hide: !resultTab,
        },
        { field: 'fields.PayeeName', headerName: 'Payee Name', width: 120,  hide: resultTab },
        {
          field: 'fields.PaymentType',
          headerName: 'Payment Type',
          ...AGGridHelper.nameColumnDefaultParams,
          hide: resultTab,
        },
        {
          field: 'fields.PaymentMethod',
          headerName: 'Payment Method',
          ...AGGridHelper.nameColumnDefaultParams,
          hide: resultTab,
        },
        {
          field: 'fields.PaymentMethodId',
          headerName: 'Payment Method',
          cellRenderer: ({ value }) => (value != null ? PaymentMethodEnum[value] : ''),
          ...AGGridHelper.nameColumnDefaultParams,
          hide: !resultTab,
        },
        {
          field: 'fields.Amount',
          headerName: 'Amount',
          cellRenderer: data => CurrencyHelper.toUsdFormat(data),
          ...AGGridHelper.nameColumnDefaultParams,
          width: 60
        },
        { field: 'fields.NumberOfClients', headerName: '# of Claims', width: 120,  hide: !resultTab },
        {
          field: 'importResultStatus',
          headerName: 'Summary',
          width: 120,
          cellClass: (params: CellClassParams) => this.getSummaryClass((params.data as ValidationResultsLineItem)),
          valueGetter: params => params.data.summary,
          hide: resultTab
        },
        { field: 'fields.BankName', headerName: 'Bank Name', width: 60, hide: !resultTab },
        { field: 'fields.AccountName', headerName: 'Account Name', width: 60, hide: !resultTab },

      ];

    if (this.documentImport.config?.RunMatchingLogicWithValidation) {
      this.gridOptions = {
        ...this.gridOptions,
        columnDefs: [
          {
            field: 'importResultStatus',
            headerName: 'Results',
            cellRenderer: data => this.splitCamelCase.transform(FileImportResultStatus[data.value]),
          },
          ...this.gridOptions.columnDefs,
        ],
      };
    }
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.GetDocumentImportsResultRequest({
      entityId: this.documentImport.id,
      documentTypeId: this.documentTypeId,
      tab: FileImportReviewTabs.AllRecords,
      agGridParams,
    }));
  }
}
