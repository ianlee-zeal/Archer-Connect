import { Component, Input } from '@angular/core';
import { BatchAction } from '@app/models/batch-action/batch-action';
import { FileImportReviewTabs } from '@app/models/enums';
import { BatchActionDocumentType } from '@app/models/enums/batch-action/batch-action-document-type.enum';

@Component({
  selector: 'app-update-by-action-template-id-grid',
  templateUrl: './update-by-action-template-id-grid.component.html',
})
export class UpdateByActionTemplateIdGridComponent {
  @Input() public tab: FileImportReviewTabs;
  @Input() public batchAction: BatchAction;
  @Input() public documentTypeId: BatchActionDocumentType;
  @Input() public actionTemplateId: number;
  public tabs = FileImportReviewTabs;
}
