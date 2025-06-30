import { Component, ElementRef, Input } from '@angular/core';
import { CellClassParams, GridOptions } from 'ag-grid-community';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { FileImportResultStatus, FileImportDocumentType, FileImportReviewTabs, FileImportTemplateTypes } from '@app/models/enums';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { GridId } from '@app/models/enums/grid-id.enum';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import * as fromShared from '@app/modules/shared/state';
import { DocumentImport } from '@app/models/documents';
import { SplitCamelCasePipe } from '@app/modules/shared/_pipes';
import { CurrencyHelper } from '@app/helpers/currency.helper';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { ValidationResultsLineItem } from '@app/models/file-imports';

const { sharedActions } = fromShared;

@Component({
  selector: 'app-file-import-all-records-list',
  templateUrl: './file-import-all-records-list.component.html',
  styleUrls: ['./file-import-all-records-list.component.scss'],
})
export class FileImportAllRecordsListComponent extends ListView {
  @Input() public documentImport: DocumentImport;
  @Input() public documentTypeId: FileImportDocumentType;

  public gridId: GridId = GridId.FileImportReviewAllRecords;

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
        field: 'summary',
        headerName: 'Summary',
        width: 120,
        cellClass: (params: CellClassParams) => this.getSummaryClass((params.data as ValidationResultsLineItem)),
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
    if (this.documentImport.templateId === FileImportTemplateTypes.DisbursementGroups) {
      const resultTab = this.documentTypeId === FileImportDocumentType.LoadingResults;

      this.gridOptions.columnDefs = [
        { field: 'rowNo', headerName: 'Row No', width: 60, hide: !resultTab },
        { field: 'fields.FirstName', headerName: 'First Name', width: 120 },
        { field: 'fields.LastName', headerName: 'Last Name', width: 120 },
        {
          field: 'fields.Amount',
          headerName: 'Amount',
          hide: resultTab,
          cellRenderer: data => CurrencyHelper.toUsdFormat(data),
          ...AGGridHelper.amountColumnDefaultParams,
        },
        {
          field: 'fields.TotalAllocation',
          headerName: 'Total Allocation',
          width: 120,
          hide: !resultTab,
          cellRenderer: data => CurrencyHelper.toUsdFormat(data),
          ...AGGridHelper.amountColumnDefaultParams,
        },
        { field: 'fields.GroupId', headerName: 'Group ID', width: 120 },
        { field: 'fields.GroupName', headerName: 'Group Name', ...AGGridHelper.nameColumnDefaultParams },
      ];
    }

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
    switch (this.documentTypeId) {
      case FileImportDocumentType.Preview:
        this.gridOptions = {
          ...this.gridOptions,
          columnDefs: [
            { field: 'rowNo', headerName: 'Row Id', width: 60 },
            ...this.gridOptions.columnDefs,
          ],
        };
        break;
        // no default
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
