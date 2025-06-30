import * as fromShared from '@app/modules/shared/state';
import { Component, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';

import { BatchAction } from '@app/models/batch-action/batch-action';
import { Observable } from 'rxjs';
import { DeficiencySummaryOption } from '@app/models/documents/document-generators/deficiency-summary-option';
import * as projectSelectors from '@app/modules/projects/state/selectors';
import * as projectActions from '@app/modules/projects/state/actions';


@Component({
  selector: 'app-authorize-entries-deficiency-summary',
  templateUrl: './authorize-entries-deficiency-summary.component.html',
  styleUrls: ['./authorize-entries-deficiency-summary.component.scss'],
})
export class AuthorizeEntriesDeficiencySummaryComponent implements OnDestroy {
  @Input() public batchAction: BatchAction;

  readonly criticalDeficiencies$: Observable<DeficiencySummaryOption[]> = this.store.select(projectSelectors.severeActionDeficienciesReview);
  readonly warningDeficiencies$: Observable<DeficiencySummaryOption[]> = this.store.select(projectSelectors.nonSevereActionDeficienciesReview);

  constructor(
    private store: Store<fromShared.AppState>,
  ) {}

  ngOnDestroy(): void {
    this.store.dispatch(projectActions.ResetBatchActionDeficiencies());
  }
}