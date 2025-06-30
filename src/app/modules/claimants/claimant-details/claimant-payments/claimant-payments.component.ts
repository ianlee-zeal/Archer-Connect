import { Component } from '@angular/core';

import { EntityTypeEnum } from '@app/models/enums';
import * as paymentsGridSelectors from '@app/modules/payments/state/selectors';
import { Claimant } from '@app/models/claimant';
import { EntityPaymentsBase } from '@app/modules/payments/base';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';

import { ClaimantDetailsState } from '../state/reducer';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';

@Component({
  selector: 'app-claimant-payments',
  templateUrl: './claimant-payments.component.html',
})
export class ClaimantPaymentsComponent extends EntityPaymentsBase<Claimant, ClaimantDetailsState> {
  readonly entityTypeId = EntityTypeEnum.Clients;
  readonly entity$ = this.store.select(selectors.item);
  readonly actionBar$ = this.store.select(paymentsGridSelectors.actionBar);

  protected onUpdateActionBar(actionBar: ActionHandlersMap): void {
    this.store.dispatch(actions.UpdateClaimantsActionBar({ actionBar }));
  }
}
