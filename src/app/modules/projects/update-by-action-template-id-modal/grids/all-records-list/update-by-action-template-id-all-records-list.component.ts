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
import { BatchAction } from '@app/models/batch-action/batch-action';

import * as projectActions from '../../../state/actions';

@Component({
  selector: 'app-update-by-action-template-id-all-records-list',
  templateUrl: './update-by-action-template-id-all-records-list.component.html',
})
export class UpdateByActionTemplateIdAllRecordsListComponent extends ListView {
  @Input() public batchAction: BatchAction;
  @Input() public documentTypeId: BatchActionDocumentType;

  public gridId: GridId = GridId.FileImportReviewAllRecords;

  constructor(
    private store: Store<fromShared.AppState>,
    protected router: Router,
    protected elementRef: ElementRef,
  ) {
    super(router, elementRef);
  }

  public gridOptions: GridOptions = {
    columnDefs: [
      { field: 'fields.ClientId', headerName: 'Client ID', width: 150 },
      { field: 'fields.FirstName', headerName: 'First Name', width: 150 },
      { field: 'fields.LastName', headerName: 'Last Name', width: 150 },
      { field: 'summary', headerName: 'Summary', width: 120 },
    ],
    animateRows: false,
    defaultColDef: {
      suppressMenu: true,
      autoHeight: true,
      wrapText: true,
      sortable: false,
    },
  };

  public ngOnInit() {
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.store.dispatch(projectActions.GetBatchActionResultRequest({
      entityId: this.batchAction.id,
      documentTypeId: this.documentTypeId,
      tab: FileImportReviewTabs.AllRecords,
      agGridParams,
    }));
  }
}
