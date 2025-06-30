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

@Component({
  selector: 'app-refund-transfer-request-records-list',
  templateUrl: './refund-transfer-request-records-list.component.html',
})
export class RefundTransferRequestRecordsListComponent extends ListView {
  @Input() public batchActionId: number;
  @Input() public documentTypeId: BatchActionDocumentType;
  @Input() public tab: FileImportReviewTabs;
  @Input() public status: BatchActionResultStatus | null;

  public gridId: GridId = GridId.RefundTransferRequestRecordsList;

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
    columnDefs: [],
  };

  public ngOnInit() {
    if (this.tab == FileImportReviewTabs.AllRecords) {
      this.setupAllRecordsColumns();
    } else if (this.tab == FileImportReviewTabs.Errors || this.tab == FileImportReviewTabs.Warnings) {
      this.setupErrorsAndWarningsColumns();
    } else {
      this.setupAllRecordsColumns();
    }
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.store.dispatch(globalPaymentQueueActions.RefundTransferValidationResult({
      batchActionId: this.batchActionId,
      documentTypeId: this.documentTypeId,
      agGridParams,
      tab: this.tab,
      status: this.status
    }));
  }

  private setupAllRecordsColumns(): void {
    this.gridOptions.columnDefs = [
        {
          headerName: 'Client ID',
          field: 'fields.ClientId',
          width: 100,
        },
        {
          headerName: 'First Name',
          field: 'fields.FirstName',
        },
        {
          headerName: 'Last Name',
          field: 'fields.LastName',
        },
        {
          headerName: 'Lien ID',
          field: 'fields.LienId',
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
          headerName: 'Summary',
          field: 'summary',
        },
      ];
  }

  private setupErrorsAndWarningsColumns(): void {
    this.gridOptions.columnDefs = [
        {
          headerName: 'Row Id',
          field: 'rowNo',
          width: 100,
        },
        {
          headerName: 'Description',
          field: 'contactName',
        },
        {
          headerName: 'Data Field',
          field: 'property',
        },
        {
          headerName: 'Data Value',
          field: 'data',
        },
        {
          headerName: 'Summary',
          field: 'summary',
        },
      ];
  }
}
