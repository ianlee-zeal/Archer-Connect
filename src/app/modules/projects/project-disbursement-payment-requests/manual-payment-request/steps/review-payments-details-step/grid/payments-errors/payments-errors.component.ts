import { Component, ElementRef, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AGGridHelper } from '@app/helpers';
import { DocumentImport } from '@app/models/documents';
import { FileImportDocumentType, GridId, FileImportReviewTabs, FileImportResultStatus } from '@app/models/enums';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { sharedActions } from '@app/modules/shared/state';
import { Store } from '@ngrx/store';
import { GridOptions } from 'ag-grid-community';
import * as fromShared from '@app/modules/shared/state';

@Component({
  selector: 'app-payments-errors',
  templateUrl: './payments-errors.component.html',
})
export class PaymentsErrorsComponent extends ListView {
  @Input() public documentImport: DocumentImport;
  @Input() public documentTypeId: FileImportDocumentType;

  public gridId: GridId = GridId.ManualPaymentsReviewErrors;

  constructor(
    private store: Store<fromShared.AppState>,
    protected router: Router,
    protected elementRef: ElementRef,
  ) {
    super(router, elementRef);
  }

  public gridOptions: GridOptions = {
    columnDefs: [
      { ...AGGridHelper.nameColumnDefaultParams, field: 'rowNo', headerName: 'Row Id' },
      { ...AGGridHelper.nameColumnDefaultParams, field: 'customSummary', headerName: 'Description', minWidth: 140, width: 140 },
      { ...AGGridHelper.nameColumnDefaultParams, field: 'property', headerName: 'Data Field' },
      { ...AGGridHelper.nameColumnDefaultParams, field: 'data', headerName: 'Data Value' },
      { ...AGGridHelper.nameColumnDefaultParams, field: 'summary', headerName: 'Summary' },
    ],
    animateRows: false,
    defaultColDef: {
      suppressMenu: true,
      autoHeight: true,
      wrapText: true,
      minWidth: 240,
      width: 240,
      sortable: false,
    },
  };

  public ngOnInit(): void {
    // if (this.documentTypeId === FileImportDocumentType.Preview) {
    //   this.gridOptions.columnDefs = this.service.addRowNoColumnIntoColDefs(this.gridOptions.columnDefs);
    // }

    // if (this.documentImport.templateId === FileImportTemplateTypes.LedgerLienDataFees) {
    //   this.gridOptions.columnDefs = this.service.addClaimantNameColumnIntoColDefs(this.gridOptions.columnDefs);
    // }
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.GetDocumentImportsResultRequest({
      entityId: this.documentImport.id,
      documentTypeId: this.documentTypeId,
      tab: FileImportReviewTabs.Errors,
      agGridParams,
      status: FileImportResultStatus.Error,
    }));
  }
}
