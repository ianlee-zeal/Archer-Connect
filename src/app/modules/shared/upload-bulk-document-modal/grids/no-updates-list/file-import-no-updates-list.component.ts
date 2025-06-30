import { Component } from '@angular/core';

import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { FileImportResultStatus, FileImportReviewTabs } from '@app/models/enums';
import { GridId } from '@app/models/enums/grid-id.enum';

import * as fromShared from '@app/modules/shared/state';
import { FileImportTemplateGrid } from '../../base/template-grid.base';

const { sharedActions } = fromShared;
@Component({
  selector: 'app-file-import-no-updates-list',
  templateUrl: './file-import-no-updates-list.component.html',
  styleUrls: ['./file-import-no-updates-list.component.scss'],
})
export class FileImportNoUpdatesListComponent extends FileImportTemplateGrid {
  public gridId: GridId = GridId.FileImportReviewNoUpdates;

  protected fetchData(agGridParams: IServerSideGetRowsParamsExtended): void {
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.GetDocumentImportsResultRequest({
      entityId: this.documentImport.id,
      documentTypeId: this.documentTypeId,
      tab: FileImportReviewTabs.NoUpdates,
      agGridParams,
      status: FileImportResultStatus.NotUpdated,
    }));
  }
}
