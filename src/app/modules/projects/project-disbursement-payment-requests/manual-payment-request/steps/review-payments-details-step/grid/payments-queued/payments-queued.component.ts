import { Component, ElementRef, Input } from '@angular/core';
import { GridId, FileImportReviewTabs, FileImportResultStatus, FileImportDocumentType } from '@app/models/enums';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import * as fromShared from '@app/modules/shared/state';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { GridOptions, ValueGetterParams } from 'ag-grid-community';
import { AGGridHelper, CurrencyHelper } from '@app/helpers';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { DocumentImport } from '@app/models/documents';

@Component({
  selector: 'app-payments-queued',
  templateUrl: './payments-queued.component.html',
})
export class PaymentsQueuedComponent extends ListView {
  @Input() public documentImport: DocumentImport;
  @Input() public documentTypeId: FileImportDocumentType;

  public gridId: GridId = GridId.FileImportReviewQueued;

  constructor(
    private store: Store<fromShared.AppState>,
    protected router: Router,
    protected elementRef: ElementRef,
  ) {
    super(router, elementRef);
  }

  public gridOptions: GridOptions = {
    columnDefs: [
      { valueGetter: (params: ValueGetterParams) => params.data.fields.OrganizationId ?? params.data.fields.ClientId, headerName: 'Payee Id', width: 60 },
      { field: 'fields.PayeeName', headerName: 'Payee Name', width: 120 },
      {
        field: 'fields.PaymentType',
        headerName: 'Payment Type',
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        field: 'fields.PaymentMethod',
        headerName: 'Payment Method',
        ...AGGridHelper.nameColumnDefaultParams,
      },
      {
        field: 'fields.Amount',
        headerName: 'Amount',
        cellRenderer: data => CurrencyHelper.toUsdFormat(data),
        ...AGGridHelper.amountColumnDefaultParams,
        width: 60
      },
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

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.store.dispatch(fromShared.sharedActions.uploadBulkDocumentActions.GetDocumentImportsResultRequest({
      entityId: this.documentImport.id,
      documentTypeId: this.documentTypeId,
      tab: FileImportReviewTabs.Queued,
      agGridParams,
      status: FileImportResultStatus.Enqueued,
    }));
  }
}
