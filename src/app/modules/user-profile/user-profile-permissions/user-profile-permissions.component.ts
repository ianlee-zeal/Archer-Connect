import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AccessPolicy } from '@app/models';
import { ActivatedRoute } from '@angular/router';
import * as accessPoliciesActions from '../../admin/user-access-policies/access-policies/state/actions';
import * as accessPoliciesSelectors from '../../admin/user-access-policies/access-policies/state/selectors';
import { AccessPoliciesState } from '../../admin/user-access-policies/access-policies/state/state';

@Component({
  selector: 'app-user-profile-permissions',
  templateUrl: './user-profile-permissions.component.html',
  styleUrls: ['./user-profile-permissions.component.scss'],
})
export class UserProfilePermissionsComponent implements OnInit, OnDestroy {
  public ngUnsubscribe$ = new Subject<void>();
  public item$ = this.store.select(accessPoliciesSelectors.accessPoliciesItem);
  public entityTypes$ = this.store.select(accessPoliciesSelectors.objectEntityTypes);
  public actionTypes$ = this.store.select(accessPoliciesSelectors.actionTypes);

  public accessPolicy: AccessPolicy;

  constructor(private store: Store<AccessPoliciesState>, private route: ActivatedRoute) { }

  public ngOnInit() {
    this.route.queryParams
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(params => {
        if (params.accessPolicyId) {
          this.store.dispatch(accessPoliciesActions.GetAccessPolicy({ id: params.accessPolicyId }));
          this.store.dispatch(accessPoliciesActions.GetAllPermissions());
          this.store.dispatch(accessPoliciesActions.GetActionTypes());
        }
      });

    this.item$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(item => {
        this.accessPolicy = item;
      });
  }
  ngOnDestroy() {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
