import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Store } from '@ngrx/store';

import { GroupedPermissions } from '@app/models/grouped-permissions';
import { GroupedAccessPolicyPermissions } from '@app/models/grouped-access-policy-permissions';
import { EntityTypeCategoryEnum } from '@app/models/enums/entity-type-category.enum';
import { PermissionV2 } from '@app/models/permission-v2';
import { EntityType } from '@app/models/entity-type';
import { PermissionActionType } from '@app/models';
import { ModalService } from '@app/services/modal.service';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { ModalFieldPermissionsComponent } from '../modal-field-permissions/modal-field-permissions.component';
import { AccessPoliciesState } from '../../state/state';
import * as accessPoliciesActions from '../../state/actions';
import { PermissionsGridBase } from '../permissions-grid-base';

@Component({
  selector: 'app-permissions-grid',
  templateUrl: './permissions-grid.component.html',
  styleUrls: ['./permissions-grid.component.scss'],
})
export class PermissionsGridComponent extends PermissionsGridBase {
  @Input() public actionTypes: PermissionActionType[];
  @Output() public selectionChanged = new EventEmitter();

  readonly actionTypeIds = PermissionActionTypeEnum;
  public advancedPermissionTooltip: string = 'Advanced Permisssions are set.';

  constructor(
    store: Store<AccessPoliciesState>,
    private readonly modalService: ModalService,
  ) {
    super(store);
  }

  public hasActivePermissions(allPermissions: GroupedPermissions, entityTypeId: number): boolean {
    const entityPermissions = allPermissions[entityTypeId] as PermissionV2[];

    return !!entityPermissions;
  }

  public hasAdditionalPermissions(allPermissions: GroupedPermissions, entityTypeId: number): boolean {
    const entityPermissions = allPermissions[entityTypeId];

    return entityPermissions?.some(perm => perm.entityType.category?.id === EntityTypeCategoryEnum.Field
      || (perm.actionType.isAdvanced && entityTypeId === perm?.entityType?.id));
  }

  public hasMainPermissions(selectedPermissions: GroupedAccessPolicyPermissions, entityTypeId: number) {
    const entityPermissions = selectedPermissions[entityTypeId];
    const entityPermissionsKeys = entityPermissions ? Object.keys(entityPermissions) : [];

    return entityPermissionsKeys.some(key => entityPermissions[key].actionType.id === PermissionActionTypeEnum.Read);
  }

  public hasAdvancedPermissionsSet(allPermissions: GroupedPermissions, selectedPermissions: GroupedAccessPolicyPermissions, entityTypeId: number): boolean {
    const entityPermissions = selectedPermissions[entityTypeId];
    const entityPermissionsKeys = entityPermissions ? Object.keys(entityPermissions) : [];
    const hasAdvancedPermission = entityPermissionsKeys?.some(key => entityPermissions[key].actionType.isAdvanced);

    // Check if there is any field permission in the selected permissions
    const fieldPermissionsList = this.fieldPermissionsPerEntityId(allPermissions, entityTypeId);
    const hasFieldPermission = fieldPermissionsList.some(key => selectedPermissions[key]);

    return hasAdvancedPermission || hasFieldPermission;
  }

  public fieldPermissionsPerEntityId(allPermissions: GroupedPermissions, entityTypeId: number): number[] {
    const entityPermissions = allPermissions[entityTypeId] as PermissionV2[];
    const fieldPermissions = entityPermissions.filter(perm => perm.entityType.category?.id === EntityTypeCategoryEnum.Field);
    return [...new Set(fieldPermissions.map(perm => perm.entityType.id))];
  }

  public isAllDisabled(selectedPermissions: GroupedAccessPolicyPermissions, allPermissions: GroupedPermissions, actionTypeId: PermissionActionTypeEnum): boolean {
    if (actionTypeId !== PermissionActionTypeEnum.Read) {
      return false;
    }
    return this.isAllEntitiesChecked(selectedPermissions, allPermissions, PermissionActionTypeEnum.Create)
      || this.isAllEntitiesChecked(selectedPermissions, allPermissions, PermissionActionTypeEnum.Edit);
  }

  public isAllEntitiesChecked(selectedPermissions: GroupedAccessPolicyPermissions, allPermissions: GroupedPermissions, actionTypeId: PermissionActionTypeEnum): boolean {
    // Check basic permissions by actionTypeId
    for (const entityType of this.entityTypes) {
      // Ignore field level permissions
      if (entityType.category?.id === EntityTypeCategoryEnum.Field) {
        continue;
      }

      const permission = selectedPermissions[entityType.id] && selectedPermissions[entityType.id][actionTypeId] as PermissionV2;

      // Check selection
      if (!permission) {
        // Permission is not selected
        // Check Deleted and not Active flagged permissions
        const disabledPermissions = allPermissions[entityType.id] as PermissionV2[];

        if (!disabledPermissions) {
          // All permissions for Entity are deleted or not active
          continue;
        } else if (disabledPermissions.findIndex(i => i.entityType.id === entityType.id && i.actionType.id === actionTypeId) === -1) {
          // Single permission is disabled
          continue;
        }

        // At least one permission is not selected
        return false;
      }
    }

    return true;
  }

  public onCheck(allPermissions: GroupedPermissions, entityTypeId: number, actionTypeId: PermissionActionTypeEnum, event: Event): void {
    super.onCheck(allPermissions, entityTypeId, actionTypeId, event);
    this.paymentsCheck(allPermissions, entityTypeId, actionTypeId, event);

    this.selectionChanged.emit();
  }

  public onCheckAll(selectedPermissions: GroupedAccessPolicyPermissions, allPermissions: GroupedPermissions, actionTypeId: PermissionActionTypeEnum, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    const basicPermissionsByAction: PermissionV2[] = [];

    // Get basic permissions by actionTypeId
    for (const entityType of this.entityTypes) {
      const actionPermissions = allPermissions[entityType.id] as PermissionV2[];

      if (actionPermissions) {
        for (let i = 0; i < actionPermissions.length; i++) {
          const permission = actionPermissions[i];
          if (permission.entityType.category?.id !== EntityTypeCategoryEnum.Field && !permission.actionType.isAdvanced) {
            if (actionTypeId === PermissionActionTypeEnum.Edit || actionTypeId === PermissionActionTypeEnum.Create) {
              const addPermission = isChecked
                ? permission.actionType.id === actionTypeId || permission.actionType.id === PermissionActionTypeEnum.Read
                : permission.actionType.id === actionTypeId;
              if (addPermission) {
                basicPermissionsByAction.push({ ...permission });
              }
            } else if (permission.actionType.id === actionTypeId && !this.isDisabledToCheck(selectedPermissions, permission.entityType.id, actionTypeId)) {
              basicPermissionsByAction.push({ ...permission });
            }
          }
        }
      }
    }

    if (isChecked) {
      this.store.dispatch(accessPoliciesActions.AddPermissionsToSelected({ permissions: basicPermissionsByAction }));
    } else {
      this.store.dispatch(accessPoliciesActions.RemovePermissionsFromSelected({ permissions: basicPermissionsByAction }));
    }

    this.selectionChanged.emit();
  }

  public onEditFieldPermissions(entityType: EntityType): void {
    this.modalService.show(ModalFieldPermissionsComponent, { initialState: { entityType, canEdit: this.canEdit } });
  }

  protected findPermissionByActionType(permissionsPerEntityType: PermissionV2[], entityTypeId: number, actionTypeId: PermissionActionTypeEnum): PermissionV2 {
    return permissionsPerEntityType.find(permission => permission.entityType.category?.id !== EntityTypeCategoryEnum.Field
      && permission.actionType?.id === actionTypeId
      && permission.entityType?.id === entityTypeId);
  }

  private paymentsCheck(allPermissions: GroupedPermissions, entityTypeId: number, actionTypeId: PermissionActionTypeEnum, event: Event) {
    const paymentType = PermissionTypeEnum.Payments;
    const stopPaymentType = PermissionTypeEnum.StopPaymentRequest;
    const checkVerificationType = PermissionTypeEnum.CheckVerification;
    const paymentHistoryType = PermissionTypeEnum.PaymentHistory;
    const readAction = PermissionActionTypeEnum.Read;

    if (entityTypeId === paymentType || entityTypeId === stopPaymentType || entityTypeId === paymentHistoryType) {
      const readPermission: PermissionV2[] = [];

      if (entityTypeId === paymentType && actionTypeId === readAction) {
        readPermission.push(this.findPermissionByActionType(allPermissions[stopPaymentType], stopPaymentType, readAction));
        readPermission.push(this.findPermissionByActionType(allPermissions[checkVerificationType], checkVerificationType, readAction));
      } else if (entityTypeId === paymentHistoryType) {
        readPermission.push(this.findPermissionByActionType(allPermissions[checkVerificationType], checkVerificationType, readAction));
      } else if (entityTypeId === stopPaymentType) {
        if (actionTypeId === readAction || actionTypeId === PermissionActionTypeEnum.Create || actionTypeId === PermissionActionTypeEnum.Edit) {
          readPermission.push(this.findPermissionByActionType(allPermissions[paymentType], paymentType, readAction));
        }
      }

      for (let i = 0; i < readPermission.length; i++) {
        if ((event.target as HTMLInputElement).checked) {
          this.store.dispatch(accessPoliciesActions.AddPermissionToSelected({ permission: readPermission[i] }));
        } else if (actionTypeId === readAction && entityTypeId == stopPaymentType) {
          this.store.dispatch(accessPoliciesActions.RemovePermissionFromSelected({ permission: readPermission[i] }));
        }
      }
    }
  }
}
