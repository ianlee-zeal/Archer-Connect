import { Component, Input } from '@angular/core';
import { BatchAction } from '@app/models/batch-action/batch-action';
import { FileImportReviewTabs } from '@app/models/enums';
import { BatchActionDocumentType } from '@app/models/enums/batch-action/batch-action-document-type.enum';
import { BatchActionResultStatus } from '@app/models/enums/batch-action/batch-action-result-status.enum';

@Component({
  selector: 'app-authorize-entries-results-grid',
  templateUrl: './authorize-entries-results-grid.component.html',
})
export class AuthorizeEntriesResultsGridComponent {
  @Input() public tab: FileImportReviewTabs;
  @Input() public batchAction: BatchAction;
  @Input() public documentTypeId: BatchActionDocumentType;
  public tabs = FileImportReviewTabs;

  public get enqueuedStatus() {
    return BatchActionResultStatus.Enqueued;
  }

  public get errorStatus() {
    return BatchActionResultStatus.Error;
  }

  public get warnStatus() {
    return BatchActionResultStatus.Warn;
  }

  public get successfulStatus() {
    return BatchActionResultStatus.Successful;
  }
}
