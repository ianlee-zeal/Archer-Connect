import { Component, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';

import * as fromShared from '@app/modules/shared/state';
import { BatchAction } from '@app/models/batch-action/batch-action';
import { Observable } from 'rxjs';
import { DeficiencySummaryOption } from '@app/models/documents/document-generators/deficiency-summary-option';
import { OutputType } from '@app/models/enums/document-generation/output-type';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';

@Component({
  selector: 'app-dw-deficiency-summary',
  templateUrl: './dw-deficiency-summary.component.html',
  styleUrls: ['dw-deficiency-summary.component.scss'],
})
export class DwDeficiencySummaryComponent implements OnDestroy {
  @Input() public batchAction: BatchAction;
  @Input() public outputType: OutputType;

  public readonly outputTypes = OutputType;

  readonly criticalDwDeficiencies$: Observable<DeficiencySummaryOption[]> = this.store.select(selectors.criticalDwDeficiencies);
  readonly warningDwDeficiencies$: Observable<DeficiencySummaryOption[]> = this.store.select(selectors.warningDwDeficiencies);

  constructor(
    private store: Store<fromShared.AppState>,
  ) {}

  ngOnDestroy(): void {
    this.store.dispatch(actions.ResetDwDeficienciesSummary());
  }
}
