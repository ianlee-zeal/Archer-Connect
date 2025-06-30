import { Component, Input } from '@angular/core';
import { BatchAction } from '@app/models/batch-action/batch-action';
import { FileImportReviewTabs } from '@app/models/enums';
import { BatchActionDocumentType } from '@app/models/enums/batch-action/batch-action-document-type.enum';
import { BatchActionResultStatus } from '@app/models/enums/batch-action/batch-action-result-status.enum';

@Component({
  selector: 'app-copy-special-payment-instructions-id-grid',
  templateUrl: './copy-special-payment-instructions-id-grid.component.html',
})
export class CopySpecialPaymentInstructionsIdGridComponent {
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

  public get updatedStatus() {
    return BatchActionResultStatus.Updated;
  }
}
