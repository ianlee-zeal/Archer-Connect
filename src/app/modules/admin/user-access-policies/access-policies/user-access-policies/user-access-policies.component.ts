import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';

import { ContextBarElement } from '@app/entities/context-bar-element'
import { AccessPoliciesState } from '../state/state';
import * as actions from '../state/actions';
import * as selectors from '../state/selectors';

@Component({
  selector: 'app-user-access-policies',
  templateUrl: './user-access-policies.component.html'
})
export class UserAccessPoliciesComponent {
  public itemDetailsHeader$ = this.store.select(selectors.accessPoliciesHeader);
  public actionbar$ = this.store.select(selectors.actionBar);

  public headerElements: ContextBarElement[];

  constructor(
    private store: Store<AccessPoliciesState>,
    private route: ActivatedRoute,
  ) {
    this.store.dispatch(actions.GetAccessPolicy({ id: this.route.snapshot.params.id }));
  }
}
