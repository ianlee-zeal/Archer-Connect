import { Component } from '@angular/core';

import { Store } from '@ngrx/store';

import { GridId } from '@app/models/enums/grid-id.enum';
import * as fromShared from '@app/modules/shared/state';
import * as projectSelectors from '@app/modules/projects/state/selectors';
import { DeficienciesListBase } from '@app/modules/shared/_abstractions/deficiencies-list.base';
import { AGGridHelper } from '@app/helpers';

@Component({
  selector: 'app-critical-deficiencies-list',
  templateUrl: './critical-deficiencies-list.component.html',
})
export class CriticalDeficienciesListComponent extends DeficienciesListBase {

  public readonly gridId: GridId = GridId.GeneratedPaymentsCriticalDeficiencies;
  readonly deficiencies$ = this.store.select(projectSelectors.paymentRequestCriticalDeficiencies);

  public gridOptions = {
    ...this.gridOptions,
    columnDefs: [
      ...this.gridOptions.columnDefs,
      {
        ...AGGridHelper.nameColumnDefaultParams,
        field: 'blockType',
        headerName: 'Payment Items Blocked for Deficient Ledgers',
      },
    ],
  };

  constructor(
    private store: Store<fromShared.AppState>,
  ) {
    super();
  }
}
