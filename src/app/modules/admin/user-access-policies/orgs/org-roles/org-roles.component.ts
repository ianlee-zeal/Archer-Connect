import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';
import { actionBar } from '@app/modules/admin/user-access-policies/roles/state/selectors';

import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { UpdateOrgRoleActionBar } from '@app/modules/admin/user-access-policies/roles/state/actions';
import { OrganizationRoleState } from '@app/modules/admin/user-access-policies/roles/state/reducers';
import { GotoParentView } from '@app/modules/shared/state/common.actions';

@Component({
  selector: 'app-org-roles',
  templateUrl: './org-roles.component.html',
})
export class OrgRolesComponent implements OnInit {
  public rolesListActionBar$ = this.store.select(actionBar);

  private readonly actionBar: ActionHandlersMap = { back: () => this.cancel() };

  private ngUnsubscribe$ = new Subject<void>();

  constructor(
    private store: Store<OrganizationRoleState>,
  ) { }

  public ngOnInit(): void {
    this.rolesListActionBar$.pipe(
      first(actionsBar => actionsBar !== null),
      takeUntil(this.ngUnsubscribe$),
    )
      .subscribe(actionsBar => {
        this.store.dispatch(UpdateOrgRoleActionBar({
          actionBar: {
            ...actionsBar,
            ...this.actionBar,
          },
        }));
      });
  }

  public ngOnDestroy(): void {
    this.store.dispatch(UpdateOrgRoleActionBar({ actionBar: null }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  private cancel(): void {
    this.store.dispatch(GotoParentView());
  }
}
