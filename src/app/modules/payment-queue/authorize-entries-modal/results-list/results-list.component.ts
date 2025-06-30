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

import * as projectActions from '@app/modules/projects/state/actions';
import { BatchActionResultStatus } from '@app/models/enums/batch-action/batch-action-result-status.enum';

@Component({
  selector: 'app-authorize-entries-results-list',
  templateUrl: './results-list.component.html',
  styleUrls: ['./results-list.component.scss'],
})
export class AuthorizeEntriesResultsListComponent extends ListView {
  @Input() public batchActionId: number;
  @Input() public documentTypeId: BatchActionDocumentType;
  @Input() public tab: FileImportReviewTabs;
  @Input() public status: BatchActionResultStatus | null;

  public gridId: GridId = GridId.AuthorizeEntriesRecordsList;

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
        headerName: 'Client ID',
        field: 'fields.ClientId',
        width: 100,
      },
      {
        headerName: 'Ledger Entry ID',
        field: 'fields.LedgerEntryId',
        width: 100,
      },
      {
        headerName: 'Account Number',
        field: 'fields.AccountNo',
      },
    ],
  };

  public ngOnInit(): void {
    if (this.tab == FileImportReviewTabs.AllRecords) {
      this.gridOptions.columnDefs.push({
        headerName: 'Summary',
        field: 'fields.Summary',
        cellRenderer: data => {
          if (data.value?.trim() === 'Error') {
            return `${data.value} <i class="fas fa-exclamation-triangle exclamation-triangle"></i>`;
          }
          if (data.value?.trim() === '') {
            return 'Success <i class="fas fa-check-square check-square"></i>';
          }
          return data.value;
        },
      });
    } else if ([FileImportReviewTabs.Warnings, FileImportReviewTabs.Errors].includes(this.tab)) {
      this.gridOptions.columnDefs.push({
        headerName: 'Summary',
        field: 'customSummary',
      });
    }
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.store.dispatch(projectActions.GetBatchActionResultRequest({
      entityId: this.batchActionId,
      documentTypeId: this.documentTypeId,
      agGridParams,
      tab: this.tab,
      status: this.status,
    }));
  }
}
