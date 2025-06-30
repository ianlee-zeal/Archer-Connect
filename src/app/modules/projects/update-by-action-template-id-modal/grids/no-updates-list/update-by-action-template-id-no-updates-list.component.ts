import { Component, ElementRef, Input } from '@angular/core';

import { GridOptions } from 'ag-grid-community';

import { FileImportReviewTabs } from '@app/models/enums';
import { GridId } from '@app/models/enums/grid-id.enum';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import * as fromShared from '@app/modules/shared/state';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { Router } from '@angular/router';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { BatchAction } from '@app/models/batch-action/batch-action';
import { BatchActionDocumentType } from '@app/models/enums/batch-action/batch-action-document-type.enum';
import { Store } from '@ngrx/store';
import { BatchActionResultStatus } from '@app/models/enums/batch-action/batch-action-result-status.enum';
import * as projectActions from '../../../state/actions';

@Component({
  selector: 'app-update-by-action-template-id-no-updates-list',
  templateUrl: './update-by-action-template-id-no-updates-list.component.html',
})
export class UpdateByActionTemplateIdNoUpdatesListComponent extends ListView {
  @Input() public batchAction: BatchAction;
  @Input() public documentTypeId: BatchActionDocumentType;
  public gridId: GridId = GridId.FileImportReviewNoUpdates;

  constructor(
    private store: Store<fromShared.AppState>,
    protected router: Router,
    protected elementRef : ElementRef,
  ) {
    super(router, elementRef);
  }

  public gridOptions: GridOptions = {
    columnDefs: [
      { ...AGGridHelper.nameColumnDefaultParams, field: 'fields.ClientId', headerName: 'Client ID', minWidth: 140, width: 140 },
      { ...AGGridHelper.nameColumnDefaultParams, field: 'fields.FirstName', headerName: 'First Name' },
      { ...AGGridHelper.nameColumnDefaultParams, field: 'fields.LastName', headerName: 'Last Name' },
      { ...AGGridHelper.nameColumnDefaultParams, field: 'fields.GroupName', headerName: 'Group Name' },
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
    this.store.dispatch(projectActions.GetBatchActionResultRequest({
      entityId: this.batchAction.id,
      documentTypeId: this.documentTypeId,
      tab: FileImportReviewTabs.NoUpdates,
      agGridParams,
      status: BatchActionResultStatus.NotUpdated,
    }));
  }
}
