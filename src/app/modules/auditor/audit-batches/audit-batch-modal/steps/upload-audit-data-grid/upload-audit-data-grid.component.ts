import { Component, Input } from '@angular/core';
import { FileImportReviewTabs } from '@app/models/enums';

@Component({
  selector: 'app-upload-audit-data-grid',
  templateUrl: './upload-audit-data-grid.component.html',
})
export class UploadAuditDataGridComponent {
  @Input() public tab: FileImportReviewTabs;
  @Input() public auditRunId: number;

  public tabs = FileImportReviewTabs;
}
