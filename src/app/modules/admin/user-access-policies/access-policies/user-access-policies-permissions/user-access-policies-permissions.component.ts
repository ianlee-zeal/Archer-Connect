import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AccessPolicy, Org } from '@app/models';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import * as accessPoliciesActions from '../state/actions';
import * as accessPoliciesSelectors from '../state/selectors';
import { AccessPoliciesState } from '../state/state';
import { GotoParentView } from '../../../../shared/state/common.actions';
import * as fromOrgs from '../../../user-access-policies/orgs/state'

@Component({
  selector: 'app-user-access-policies-permissions',
  templateUrl: './user-access-policies-permissions.component.html',
  styleUrls: ['./user-access-policies-permissions.component.scss'],
})
export class UserAccessPoliciesPermissionsComponent implements OnInit, OnDestroy {
  public ngUnsubscribe$ = new Subject<void>();
  public item$ = this.store.select(accessPoliciesSelectors.accessPoliciesItem);
  public entityTypes$ = this.store.select(accessPoliciesSelectors.objectEntityTypes);
  public actionTypes$ = this.store.select(accessPoliciesSelectors.actionTypes);
  private org$ = this.store.select(fromOrgs.item);

  public accessPolicy: AccessPolicy;
  private hasChangedPermissions: boolean;
  private isMaster: boolean = false;
  public canEditAccessPolicies = (this.permissionService.canEdit(PermissionTypeEnum.AccessPolicies));

  constructor(
    private store: Store<AccessPoliciesState>,
    private permissionService: PermissionService,
  ) { }

  public ngOnInit() {
    this.store.dispatch(accessPoliciesActions.GetAllPermissions());
    this.store.dispatch(accessPoliciesActions.GetActionTypes());

    this.item$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(item => {
        this.accessPolicy = item;
      });

    this.store.dispatch(accessPoliciesActions.UpdateAccessPoliciesActionBar({
      actionBar: {
        save: {
          callback: () => this.save(),
          disabled: () => !this.hasChangedPermissions,
          permissions: PermissionService.create(PermissionTypeEnum.AccessPolicies, PermissionActionTypeEnum.Edit),
          awaitedActionTypes: [
            accessPoliciesActions.UpdateAccessPolicySuccess.type,
            accessPoliciesActions.UpdateAccessPolicyError.type,
          ],
        },
        back: { callback: () => this.store.dispatch(GotoParentView()) },
      },
    }));

    this.subscribeToOrg();
  }

  subscribeToOrg(): void {
    this.org$.pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((org: Org) => {
        this.isMaster = org.isMaster;

        const isGlobalPolicy = this.accessPolicy.organizationId === null;

        this.canEditAccessPolicies = this.permissionService.canEdit(PermissionTypeEnum.AccessPolicies) && (!isGlobalPolicy || (isGlobalPolicy && this.isMaster));
      });
  }

  public permissionsChanged() {
    this.hasChangedPermissions = true;
  }

  private save() {
    this.store.dispatch(accessPoliciesActions.UpdateAccessPolicyRequest({
      item: this.accessPolicy,
      callback: () => { this.hasChangedPermissions = false; },
    }));
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
