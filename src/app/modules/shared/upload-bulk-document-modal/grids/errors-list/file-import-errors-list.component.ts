import { Component, ElementRef, Input } from '@angular/core';
import { Router } from '@angular/router';

import { Store } from '@ngrx/store';
import { GridOptions } from 'ag-grid-community';

import { DocumentImport } from '@app/models/documents';
import { FileImportDocumentType, FileImportResultStatus, FileImportReviewTabs, FileImportTemplateTypes } from '@app/models/enums';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ListView } from '@app/modules/shared/_abstractions/list-view';

import * as fromShared from '@app/modules/shared/state';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { UploadBulkDocumentModalService } from '@app/services/upload-bulk-document-modal.service';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

const { sharedActions } = fromShared;
@Component({
  selector: 'app-file-import-errors-list',
  templateUrl: './file-import-errors-list.component.html',
  styleUrls: ['./file-import-errors-list.component.scss'],
})
export class FileImportErrorsListComponent extends ListView {
  @Input() public documentImport: DocumentImport;
  @Input() public documentTypeId: FileImportDocumentType;

  public gridId: GridId = GridId.FileImportReviewErrors;

  constructor(
    private store: Store<fromShared.AppState>,
    protected router: Router,
    protected elementRef : ElementRef,
    private readonly service: UploadBulkDocumentModalService,
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
    if (this.documentTypeId === FileImportDocumentType.Preview) {
      this.gridOptions.columnDefs = this.service.addRowNoColumnIntoColDefs(this.gridOptions.columnDefs);
    }

    if (this.documentImport.templateId === FileImportTemplateTypes.LedgerLienDataFees) {
      this.gridOptions.columnDefs = this.service.addClaimantNameColumnIntoColDefs(this.gridOptions.columnDefs);
    }
  }

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.GetDocumentImportsResultRequest({
      entityId: this.documentImport.id,
      documentTypeId: this.documentTypeId,
      tab: FileImportReviewTabs.Errors,
      agGridParams,
      status: FileImportResultStatus.Error,
    }));
  }
}
