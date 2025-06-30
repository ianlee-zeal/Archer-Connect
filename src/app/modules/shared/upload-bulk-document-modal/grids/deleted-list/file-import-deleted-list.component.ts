import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Store } from '@ngrx/store';
import { GridOptions } from 'ag-grid-community';

import { DocumentImport } from '@app/models/documents';
import { FileImportDocumentType, FileImportResultStatus, FileImportReviewTabs } from '@app/models/enums';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';
import * as fromShared from '@app/modules/shared/state';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { CurrencyHelper } from '@app/helpers';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

@Component({
  selector: 'app-file-import-deleted-list',
  templateUrl: './file-import-deleted-list.component.html',
  styleUrls: ['./file-import-deleted-list.component.scss'],
})
export class FileImportDeletedListComponent extends ListView implements OnInit {
  @Input() public documentImport: DocumentImport;
  @Input() public documentTypeId: FileImportDocumentType;

  public gridId: GridId = GridId.FileImportReviewDeleted;

  constructor(
    private store: Store<fromShared.AppState>,
    protected router: Router,
    protected elementRef : ElementRef,
  ) {
    super(router, elementRef);
  }

  public gridOptions: GridOptions = {
    columnDefs: [
      { ...AGGridHelper.nameColumnDefaultParams, field: 'clientId', headerName: 'Client ID' },
      { ...AGGridHelper.nameColumnDefaultParams, field: 'property', headerName: 'Data Field' },
      { ...AGGridHelper.nameColumnDefaultParams, field: 'data', headerName: 'Data Value', cellRenderer: CurrencyHelper.toUsdFormat },
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

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.store.dispatch(fromShared.sharedActions.uploadBulkDocumentActions.GetDocumentImportsResultRequest({
      entityId: this.documentImport.id,
      documentTypeId: this.documentTypeId,
      tab: FileImportReviewTabs.Deleted,
      agGridParams,
      status: FileImportResultStatus.Deleted,
    }));
  }
}
