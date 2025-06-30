import { Component, Input } from '@angular/core';
import { DocumentImport } from '@app/models/documents';

import { FileImportDocumentType, FileImportReviewTabs } from '@app/models/enums';

@Component({
  selector: 'app-upload-bulk-document-group-grid',
  templateUrl: './upload-bulk-document-group-grid.component.html',
})
export class UploadBulkDocumentGroupGridComponent {
 @Input() public tab: FileImportReviewTabs;
 @Input() public documentImport: DocumentImport;
 @Input() public documentTypeId: FileImportDocumentType;

 public tabs = FileImportReviewTabs;

}
