import { Component, ElementRef, Input } from '@angular/core';
import { Router } from '@angular/router';

import { Store } from '@ngrx/store';
import { GridOptions } from 'ag-grid-community';

import { FileImportReviewTabs } from '@app/models/enums';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import { BatchActionDocumentType } from '@app/models/enums/batch-action/batch-action-document-type.enum';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import * as fromShared from '@app/modules/shared/state';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { BatchAction } from '@app/models/batch-action/batch-action';

import { BatchActionResultStatus } from '@app/models/enums/batch-action/batch-action-result-status.enum';
import * as projectActions from '../../../state/actions';

@Component({
  selector: 'app-update-by-action-template-id-errors-list',
  templateUrl: './update-by-action-template-id-errors-list.component.html',
})
export class UpdateByActionTemplateIdErrorsListComponent extends ListView {
  @Input() public batchAction: BatchAction;
  @Input() public documentTypeId: BatchActionDocumentType;

  public gridId: GridId = GridId.FileImportReviewErrors;

  constructor(
    private store: Store<fromShared.AppState>,
    protected router: Router,
    protected elementRef : ElementRef,
  ) {
    super(router, elementRef);
  }

  public gridOptions: GridOptions = {
    columnDefs: [
      { ...AGGridHelper.nameColumnDefaultParams, field: 'description', headerName: 'Description', minWidth: 140, width: 140 },
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

  public ngOnInit():void {
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.store.dispatch(projectActions.GetBatchActionResultRequest({
      entityId: this.batchAction.id,
      documentTypeId: this.documentTypeId,
      tab: FileImportReviewTabs.Errors,
      agGridParams,
      status: BatchActionResultStatus.Error,
    }));
  }
}
