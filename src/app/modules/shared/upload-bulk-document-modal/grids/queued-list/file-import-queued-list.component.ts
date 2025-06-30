import { Component } from '@angular/core';

import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { FileImportResultStatus, FileImportReviewTabs } from '@app/models/enums';
import { GridId } from '@app/models/enums/grid-id.enum';
import * as fromShared from '@app/modules/shared/state';
import { FileImportTemplateGrid } from '../../base/template-grid.base';

@Component({
  selector: 'app-file-import-queued-list',
  templateUrl: './file-import-queued-list.component.html',
  styleUrls: ['./file-import-queued-list.component.scss'],
})
export class FileImportQueuedListComponent extends FileImportTemplateGrid {
  public gridId: GridId = GridId.FileImportReviewQueued;

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.store.dispatch(fromShared.sharedActions.uploadBulkDocumentActions.GetDocumentImportsResultRequest({
      entityId: this.documentImport.id,
      documentTypeId: this.documentTypeId,
      tab: FileImportReviewTabs.Queued,
      agGridParams,
      status: FileImportResultStatus.Enqueued,
    }));
  }
}
