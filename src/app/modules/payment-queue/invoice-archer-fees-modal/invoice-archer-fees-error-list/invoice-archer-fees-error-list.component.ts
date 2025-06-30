import { Component, ElementRef, Input } from '@angular/core';
import { Router } from '@angular/router';
import { BatchAction } from '@app/models/batch-action/batch-action';
import { FileImportReviewTabs } from '@app/models/enums';
import { BatchActionDocumentType } from '@app/models/enums/batch-action/batch-action-document-type.enum';
import { BatchActionResultStatus } from '@app/models/enums/batch-action/batch-action-result-status.enum';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import * as fromShared from '@app/modules/shared/state';
import { Store } from '@ngrx/store';
import { GridOptions } from 'ag-grid-community';
import * as projectActions from '../../../projects/state/actions';

@Component({
  selector: 'app-invoice-archer-fees-error-list',
  templateUrl: './invoice-archer-fees-error-list.component.html',
})
export class InvoiceArcherFeesErrorWarningListComponent extends ListView {
  @Input() public batchAction: BatchAction;
  @Input() public documentTypeId: BatchActionDocumentType;
  @Input() public tab: FileImportReviewTabs;

  public gridId: GridId = GridId.InvoiceArcherFeesErrorList;

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
        headerName: 'Client Id',
        field: 'fields.ClientId',
      },
      {
        headerName: 'Ledger Entry Id',
        field: 'fields.EntryId',
      },
      {
        headerName: 'Account Number',
        field: 'fields.AccountNo',
      },
      {
        headerName: 'Amount',
        field: 'fields.Amount',
      },
      {
        headerName: 'Summary',
        field: 'summary',
      },
    ],
  };

  public ngOnInit(): void {
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    let status = BatchActionResultStatus.Error;
    if (this.tab === FileImportReviewTabs.Warnings) {
      status = BatchActionResultStatus.Warn;
    }

    this.store.dispatch(projectActions.GetBatchActionResultRequest({
      entityId: this.batchAction.id,
      documentTypeId: this.documentTypeId,
      tab: this.tab,
      agGridParams,
      status,
    }));
  }
}
