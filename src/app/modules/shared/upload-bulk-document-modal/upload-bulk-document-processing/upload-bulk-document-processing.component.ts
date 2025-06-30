import { Component, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

import { DocumentImport } from '@app/models/documents';
import { GridOptions } from 'ag-grid-community';
import { AGGridHelper } from '@app/helpers/ag-grid.helper';
import { Store } from '@ngrx/store';
import * as fromShared from '../../state';

const { sharedSelectors } = fromShared;
@Component({
  selector: 'app-upload-bulk-document-processing',
  templateUrl: './upload-bulk-document-processing.component.html',
  styleUrls: ['./upload-bulk-document-processing.component.scss'],
})
export class UploadBulkDocumentProcessingComponent implements OnDestroy {
  @Input() documentImport: DocumentImport;

  private ngUnsubscribe$: Subject<void> = new Subject<void>();
  public progressValues$ = this.store.select(sharedSelectors.uploadBulkDocumentSelectors.progressValues);

  public gridOptions: GridOptions = {
    columnDefs: [
      { suppressMenu: true, field: 'Inserts' },
      { suppressMenu: true, field: 'Updates' },
      { suppressMenu: true, field: 'Deletes' },
      { suppressMenu: true, field: 'NoUpdates', headerName: 'No Updates' },
    ],
    animateRows: false,
    defaultColDef: {
      cellStyle: { 'text-align': 'center' },
      ...AGGridHelper.numberColumnDefaultParams,
    },
    rowModelType: AGGridHelper.ROW_MODEL_TYPE_CLIENT_SIDE,
    rowHeight: 35,
  };

  constructor(
    private store: Store<fromShared.AppState>,
  ) { }

  getFileName() {
    const fileName = this.documentImport?.fileContent?.name || this.documentImport?.importDoc?.fileName || this.documentImport.fileName;
    const ext = (this.documentImport?.mimeType?.extension || this.documentImport?.importDoc?.mimeType?.extension) ?? '';
    const formattedExtension = ext ? `.${ext}` : '';
    return `${fileName ?? ''}${formattedExtension}`;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
