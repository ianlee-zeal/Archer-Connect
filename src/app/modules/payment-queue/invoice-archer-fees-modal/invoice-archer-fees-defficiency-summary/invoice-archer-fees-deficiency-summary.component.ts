import { Component, Input } from '@angular/core';
import { BatchActionReviewOption } from '@app/models/batch-action/batch-action-review-option';
import { FileImportReviewTabs } from '@app/models/enums';
import { BatchActionDocumentType } from '@app/models/enums/batch-action/batch-action-document-type.enum';
import * as fromShared from '@app/modules/shared/state';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as globalPaymentQueueSelectors from '../../state/selectors';

@Component({
  selector: 'app-invoice-archer-fees-deficiency-summary',
  templateUrl: './invoice-archer-fees-deficiency-summary.component.html',
  styleUrls: ['invoice-archer-fees-deficiency-summary.component.scss'],
})
export class InvoiceArcherFeesDeficiencySummaryComponent {
  @Input() public batchActionId: number;
  @Input() public documentTypeId: BatchActionDocumentType;
  @Input() public tab: FileImportReviewTabs;

  readonly criticalDeficiencies$: Observable<BatchActionReviewOption[]> = this.store.select(globalPaymentQueueSelectors.criticalDeficiencies);
  readonly warningDeficiencies$: Observable<BatchActionReviewOption[]> = this.store.select(globalPaymentQueueSelectors.warningDeficiencies);

  constructor(
    private store: Store<fromShared.AppState>,
  ) {}
}
