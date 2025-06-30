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

import * as globalPaymentQueueActions from '../../state/actions';
import { BatchActionResultStatus } from '@app/models/enums/batch-action/batch-action-result-status.enum';

@Component({
  selector: 'app-copy-special-payment-instructions-records-list',
  templateUrl: './copy-special-payment-instructions-records-list.component.html',
})
export class CopySpecialPaymentInstructionsRecordsListComponent extends ListView {
  @Input() public batchActionId: number;
  @Input() public documentTypeId: BatchActionDocumentType;
  @Input() public tab: FileImportReviewTabs;
  @Input() public status: BatchActionResultStatus | null;

  public gridId: GridId = GridId.CopySPIValidationReviewRecords;

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
        headerName: 'Ledger Entry ID',
        field: 'fields.CopyToLedgerEntryId',
        width: 100,
      },
      {
        headerName: 'Client ID',
        field: 'fields.ClientId',
        width: 100,
      },
      {
        headerName: 'Last Name',
        field: 'fields.LastName',
      },
      {
        headerName: 'First Name',
        field: 'fields.FirstName',
      },
      {
        headerName: 'Account',
        field: 'fields.Account',
      },
      {
        headerName: 'Summary',
        field: 'fields.Summary',
      },
    ],
  };

  public ngOnInit() {
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.store.dispatch(globalPaymentQueueActions.CopySpecialPaymentInstructionsValidationResult({
      batchActionId: this.batchActionId,
      documentTypeId: this.documentTypeId,
      agGridParams,
      tab: this.tab,
      status: this.status
    }));
  }
}
