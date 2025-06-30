import { Component, ElementRef, Input } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { FileImportReviewTabs } from '@app/models/enums';
import { BatchActionDocumentType } from '@app/models/enums/batch-action/batch-action-document-type.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { GridId } from '@app/models/enums/grid-id.enum';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import * as fromShared from '@app/modules/shared/state';

import * as globalPaymentQueueActions from '../../../state/actions';
import { BatchActionResultStatus } from '@app/models/enums/batch-action/batch-action-result-status.enum';
import { AGGridHelper } from '@app/helpers';

@Component({
  selector: 'app-refund-transfer-request-result-grid',
  templateUrl: './refund-transfer-request-result-grid.component.html',
})
export class RefundTransferRequestResultGridComponent extends ListView {
  @Input() public batchActionId: number;
  @Input() public documentTypeId: BatchActionDocumentType;
  @Input() public status: BatchActionResultStatus | null;

  public gridId: GridId = GridId.RefundTransferRequestResultsList;

  constructor(
    private store: Store<fromShared.AppState>,
    protected router: Router,
    protected elementRef: ElementRef,
  ) {
    super(router, elementRef);
  }

  public gridOptions: GridOptions = {
    animateRows: false,
    defaultColDef: {
      suppressMenu: true,
      autoHeight: true,
      wrapText: true,
      sortable: false,
    },
    columnDefs: [
      {
        headerName: 'Request ID',
        field: 'fields.TransferRequestId',
        width: 100,
      },
      {
        headerName: 'Payee',
        field: 'fields.Payment.PayeeName',
      },
      {
        headerName: 'Payee ID',
        field: 'fields.Payment.PayeeId',
      },
      {
        headerName: 'Payment Type',
        field: 'fields.PaymentType',
      },
      {
        headerName: 'Refund Amount',
        field: 'fields.Amount',
      },
      {
        headerName: '# of Claims',
        field: 'numberOfClients',
        ...AGGridHelper.nameColumnDefaultParams,
        maxWidth: 100,
        cellRenderer: 'valueWithTooltip',
        sortable: true,
      },
      {
        headerName: 'Bank Name',
        field: 'fields.BankName',
      },
      {
        headerName: 'Account Name',
        field: 'fields.AccountName',
      },
    ],
  };

  public ngOnInit() {
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.store.dispatch(globalPaymentQueueActions.RefundTransferValidationResult({
      batchActionId: this.batchActionId,
      documentTypeId: this.documentTypeId,
      agGridParams,
      tab: FileImportReviewTabs.AllRecords,
      status: this.status
    }));
  }
}
