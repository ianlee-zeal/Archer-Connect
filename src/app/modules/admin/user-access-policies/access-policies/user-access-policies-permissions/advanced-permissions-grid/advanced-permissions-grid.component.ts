import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { GroupedPermissions } from '@app/models/grouped-permissions';
import { GroupedAccessPolicyPermissions } from '@app/models/grouped-access-policy-permissions';
import { EntityTypeCategoryEnum } from '@app/models/enums/entity-type-category.enum';
import { PermissionV2 } from '@app/models/permission-v2';
import { EntityType } from '@app/models/entity-type';
import { PermissionActionType } from '@app/models';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { AccessPoliciesState } from '../../state/state';
import * as accessPoliciesActions from '../../state/actions';
import * as accessPoliciesSelectors from '../../state/selectors';

@Component({
  selector: 'app-advanced-permissions-grid',
  templateUrl: './advanced-permissions-grid.component.html',
  styleUrls: ['./advanced-permissions-grid.component.scss'],
})
export class AdvancedPermissionsGridComponent implements OnInit, OnDestroy {
  @Input() public entityType: EntityType;
  @Input() public canEdit: boolean = true;

  public allPermissions$ = this.store.select(accessPoliciesSelectors.allPermissions);
  public selectedPermissions$ = this.store.select(accessPoliciesSelectors.selectedPermissions);
  public actionTypes$ = this.store.select(accessPoliciesSelectors.actionTypes);
  public ngUnsubscribe$ = new Subject<void>();

  public actionTypes: PermissionActionType[];

  constructor(private store: Store<AccessPoliciesState>) { }

  public ngOnInit() {
    this.actionTypes$
      .pipe(
        filter(actions => !!actions),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(actions => {
        this.actionTypes = actions.filter(i => i.isAdvanced);
      });
  }

  public isPermissionExist(allPermissions: GroupedPermissions, entityTypeId: number, actionTypeId: number): boolean {
    const permissionsPerEntityType = allPermissions[entityTypeId] as PermissionV2[];

    return !!permissionsPerEntityType?.find(p => p.entityType.id === entityTypeId && p.actionType.id === actionTypeId);
  }

  public isPermissionChecked(permissions: GroupedAccessPolicyPermissions, entityTypeId: number, actionTypeId: number): boolean {
    return permissions[entityTypeId] && permissions[entityTypeId][actionTypeId];
  }

  public isPermissionDisabled(permissions: GroupedAccessPolicyPermissions, entityTypeId: number, actionTypeId: number): boolean {
    // Remove Hold Permission Case
    if (entityTypeId === PermissionTypeEnum.Clients && actionTypeId === PermissionActionTypeEnum.ClaimantRemoveFromHold) {
      const hasClaimantPutOnHoldPermission = permissions[entityTypeId] && permissions[entityTypeId][PermissionActionTypeEnum.ClaimantPutOnHold];
      return !hasClaimantPutOnHoldPermission;
    }
    return false;
  }

  public isAllAdvancedPermissionsChecked(allPermissions: GroupedPermissions, entityTypeId: number, selectedPermissions: GroupedAccessPolicyPermissions): boolean {
    const permissionsPerEntityType = allPermissions[entityTypeId] as PermissionV2[];
    const advancedPermissionsPerEntityType = permissionsPerEntityType.filter(p => p.entityType.id === this.entityType.id && p.actionType.isAdvanced);
    return !advancedPermissionsPerEntityType.some(p => !selectedPermissions[entityTypeId]?.[p.actionType.id]);
  }

  public onCheck(allPermissions: GroupedPermissions, entityTypeId: number, actionTypeId: number, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const permissionsPerEntityType = allPermissions[entityTypeId] as PermissionV2[];

    const targetPermission = permissionsPerEntityType.find(permission => permission.entityType.category?.id !== EntityTypeCategoryEnum.Field
      && permission.actionType?.id === actionTypeId);

    checked
      ? this.store.dispatch(accessPoliciesActions.AddPermissionToSelected({ permission: targetPermission }))
      : this.store.dispatch(accessPoliciesActions.RemovePermissionFromSelected({ permission: targetPermission }));

    this.changeAssociatedPermission(permissionsPerEntityType, entityTypeId, actionTypeId, checked);
  }

  public onCheckAll(allPermissions: GroupedPermissions, entityTypeId: number, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;

    const permissionsPerEntityType = allPermissions[entityTypeId] as PermissionV2[];
    const advancedPermissionsPerEntityType =  permissionsPerEntityType.filter(p => p.entityType.id === entityTypeId && p.actionType.isAdvanced);

    isChecked
      ? this.store.dispatch(accessPoliciesActions.AddPermissionsToSelected({ permissions: advancedPermissionsPerEntityType }))
      : this.store.dispatch(accessPoliciesActions.RemovePermissionsFromSelected({ permissions: advancedPermissionsPerEntityType }));
  }

  private changeAssociatedPermission(permissions: PermissionV2[], entityTypeId: number, actionTypeId: number, checked: boolean) {
    // Remove Hold Permission Case
    if (entityTypeId === PermissionTypeEnum.Clients && actionTypeId === PermissionActionTypeEnum.ClaimantPutOnHold && !checked) {
      const removePermission = permissions.find(permission => permission.entityType.category?.id !== EntityTypeCategoryEnum.Field
        && permission.actionType?.id === PermissionActionTypeEnum.ClaimantRemoveFromHold);
      this.store.dispatch(accessPoliciesActions.RemovePermissionFromSelected({ permission: removePermission }));
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
