import { Component, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';

import * as fromShared from '@app/modules/shared/state';
import { BatchAction } from '@app/models/batch-action/batch-action';
import * as projectActions from '@app/modules/projects/state/actions';
import * as projectSelectors from '@app/modules/projects/state/selectors';
import { Observable } from 'rxjs';
import { BatchActionReviewOption } from '@app/models/batch-action/batch-action-review-option';

@Component({
  selector: 'app-update-ledger-stage-deficiency-summary',
  templateUrl: './update-ledger-stage-deficiency-summary.component.html',
  styleUrls: ['update-ledger-stage-deficiency-summary.component.scss'],
})
export class UpdateLedgerStageDeficiencySummaryComponent implements OnDestroy {
  @Input() public batchAction: BatchAction;

  readonly criticalDeficiencies$: Observable<BatchActionReviewOption[]> = this.store.select(projectSelectors.criticalActionDeficienciesReview);
  readonly warningDeficiencies$: Observable<BatchActionReviewOption[]> = this.store.select(projectSelectors.warningActionDeficienciesReview);

  constructor(
    private store: Store<fromShared.AppState>,
  ) {}

  ngOnDestroy(): void {
    this.store.dispatch(projectActions.ResetBatchActionDeficiencies());
  }
}
