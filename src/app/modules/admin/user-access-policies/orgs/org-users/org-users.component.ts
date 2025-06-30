import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';
import { actionBar } from '@app/modules/admin/user-access-policies/users/state/selectors';
import { orgTypesSelectors } from '@app/modules/admin/user-access-policies/orgs/state/selectors';

import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { UpdateUsersListActionBar } from '@app/modules/admin/user-access-policies/users/state/actions';
import { GotoParentView } from '@app/modules/shared/state/common.actions';
import { AppState } from '../state';

@Component({
  selector: 'app-org-users',
  templateUrl: './org-users.component.html',
})
export class OrgUsersComponent implements OnInit {
  public readonly orgId$ = this.store.select(orgTypesSelectors.orgId);

  private readonly usersListActionBar$ = this.store.select(actionBar);
  private readonly actionBar: ActionHandlersMap = { back: () => this.cancel() };

  private readonly ngUnsubscribe$ = new Subject<void>();

  constructor(
    private readonly store: Store<AppState>,
  ) { }

  public ngOnInit(): void {
    this.usersListActionBar$.pipe(
      first(actionsBar => actionsBar !== null),
      takeUntil(this.ngUnsubscribe$),
    )
      .subscribe(actionsBar => {
        this.store.dispatch(UpdateUsersListActionBar({
          actionBar: {
            ...actionsBar,
            ...this.actionBar,
          },
        }));
      });
  }

  public ngOnDestroy(): void {
    this.store.dispatch(UpdateUsersListActionBar({ actionBar: null }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  private cancel(): void {
    this.store.dispatch(GotoParentView('admin/user/orgs'));
  }
}
