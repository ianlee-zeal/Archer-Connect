import { Component, Input } from '@angular/core';
import { BatchAction } from '@app/models/batch-action/batch-action';
import { FileImportReviewTabs } from '@app/models/enums';
import { BatchActionDocumentType } from '@app/models/enums/batch-action/batch-action-document-type.enum';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-invoice-archer-fees-grid',
  templateUrl: './invoice-archer-fees-grid.component.html',
})
export class InvoiceArcherFeesGridComponent {
  @Input() public tab: FileImportReviewTabs;
  @Input() public batchAction: BatchAction;
  @Input() public resultDocId: number;
  public documentTypeId: BatchActionDocumentType = BatchActionDocumentType.PreviewValidation;
  public tabs = FileImportReviewTabs;
  public dataReady: boolean;
  protected ngUnsubscribe$ = new Subject<void>();

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
