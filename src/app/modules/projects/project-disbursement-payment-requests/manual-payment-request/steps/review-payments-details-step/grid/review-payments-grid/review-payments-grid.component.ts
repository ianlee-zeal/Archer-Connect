import { Component, Input } from '@angular/core';
import { DocumentImport } from '@app/models/documents';
import { FileImportReviewTabs, FileImportDocumentType } from '@app/models/enums';

@Component({
  selector: 'app-review-payments-grid',
  templateUrl: './review-payments-grid.component.html'
})
export class ReviewPaymentsGridComponent {
  @Input() public tab: FileImportReviewTabs;
  @Input() public documentImport: DocumentImport;
  @Input() public documentTypeId: FileImportDocumentType;

  public tabs = FileImportReviewTabs;
}
