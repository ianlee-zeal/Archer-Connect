import { Store } from '@ngrx/store';
import { Directive, Input } from '@angular/core';

import { PermissionV2 } from '@app/models';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { GroupedAccessPolicyPermissions } from '@app/models/grouped-access-policy-permissions';
import { GroupedPermissions } from '@app/models/grouped-permissions';
import { EntityType } from '@app/models/entity-type';

import { PermissionService } from '@app/services';
import * as accessPoliciesActions from '../state/actions';
import * as accessPoliciesSelectors from '../state/selectors';
import { AccessPoliciesState } from '../state/state';

interface IDependedPermission {
  shouldDisableSelectedPerm: boolean;
  depends: string[];
  onCheckCallback?:(allPermissions: GroupedPermissions, checked: boolean) => void;
}

@Directive()
export abstract class PermissionsGridBase {
  readonly allPermissions$ = this.store.select(accessPoliciesSelectors.allPermissions);
  readonly selectedPermissions$ = this.store.select(accessPoliciesSelectors.selectedPermissions);

  @Input() entityTypes: EntityType[];

  @Input() canEdit: boolean = true;

  // AC-5658 this Map stores a list of permission dependencies that are automatically enabled
  private permissionsDependencies = new Map<string, IDependedPermission>([
    [
      PermissionService.create(PermissionTypeEnum.Projects, PermissionActionTypeEnum.Read),
      {
        shouldDisableSelectedPerm: true,
        depends: [PermissionService.create(PermissionTypeEnum.ProjectsDocuments, PermissionActionTypeEnum.Read)],
      },
    ],
    [
      PermissionService.create(PermissionTypeEnum.LedgerSettings, PermissionActionTypeEnum.Read),
      {
        shouldDisableSelectedPerm: false,
        depends: [PermissionService.create(PermissionTypeEnum.ClaimSettlementLedgers, PermissionActionTypeEnum.Read)],
        onCheckCallback: (allPermissions: GroupedPermissions, checked: boolean) => {
          const entityTypeId = PermissionTypeEnum.ClaimSettlementLedgers;
          this.addDependentPermission(allPermissions, entityTypeId, checked);
        },
      },
    ],
    [
      PermissionService.create(PermissionTypeEnum.ClaimSettlementLedgers, PermissionActionTypeEnum.Read),
      {
        shouldDisableSelectedPerm: true,
        depends: [PermissionService.create(PermissionTypeEnum.LedgerSettings, PermissionActionTypeEnum.Read)],
      },
    ],
    [
      PermissionService.create(PermissionTypeEnum.OrganizationAddresses, PermissionActionTypeEnum.Read),
      {
        shouldDisableSelectedPerm: false,
        depends: [PermissionService.create(PermissionTypeEnum.Organizations, PermissionActionTypeEnum.Read)],
        onCheckCallback: (allPermissions: GroupedPermissions, checked: boolean) => {
          const entityTypeId = PermissionTypeEnum.Organizations;
          this.addDependentPermission(allPermissions, entityTypeId, checked);
        },
      },
    ],
    [
      PermissionService.create(PermissionTypeEnum.CheckVerification, PermissionActionTypeEnum.Read),
      {
        shouldDisableSelectedPerm: true,
        depends: [PermissionService.create(PermissionTypeEnum.Payments, PermissionActionTypeEnum.Read), PermissionService.create(PermissionTypeEnum.PaymentHistory, PermissionActionTypeEnum.Read)],
        onCheckCallback: (allPermissions: GroupedPermissions, checked: boolean) => {
          const entityTypeId = PermissionTypeEnum.CheckVerification;
          this.addDependentPermission(allPermissions, entityTypeId, checked);
        },
      },
    ],
    [
      PermissionService.create(PermissionTypeEnum.GlobalDeficiencies, PermissionActionTypeEnum.Read),
      {
        shouldDisableSelectedPerm: false,
        depends: [PermissionService.create(PermissionTypeEnum.ProjectDeficiencies, PermissionActionTypeEnum.Read)],
        onCheckCallback: (allPermissions: GroupedPermissions, checked: boolean) => {
          const entityTypeId = PermissionTypeEnum.ProjectDeficiencies;
          this.addDependentPermission(allPermissions, entityTypeId, checked);
        },
      },
    ],
    [
      PermissionService.create(PermissionTypeEnum.ProjectDeficiencies, PermissionActionTypeEnum.Read),
      {
        shouldDisableSelectedPerm: true,
        depends: [PermissionService.create(PermissionTypeEnum.GlobalDeficiencies, PermissionActionTypeEnum.Read)],
      },
    ],
  ]);

  constructor(protected readonly store: Store<AccessPoliciesState>) {}

  public isPermissionChecked(selectedPermissions: GroupedAccessPolicyPermissions, entityTypeId: number, actionTypeId: number): boolean {
    return selectedPermissions[entityTypeId] && selectedPermissions[entityTypeId][actionTypeId];
  }

  public onCheck(allPermissions: GroupedPermissions, entityTypeId: number, actionTypeId: PermissionActionTypeEnum, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const permissionsPerEntityType = allPermissions[entityTypeId] as PermissionV2[];
    if (permissionsPerEntityType) {
      this.updatePermissions(permissionsPerEntityType, entityTypeId, actionTypeId, checked);
    }
    const permissionKey = PermissionService.create(entityTypeId, actionTypeId);
    const dependencyValue = this.permissionsDependencies.get(permissionKey);
    if (dependencyValue && dependencyValue.onCheckCallback) {
      dependencyValue.onCheckCallback(allPermissions, checked);
    }
  }

  public isDisabled(selectedPermissions: GroupedAccessPolicyPermissions, entityTypeId: number, actionTypeId: PermissionActionTypeEnum) {
    if (this.isDependentPermission(selectedPermissions, entityTypeId, actionTypeId)) {
      return true;
    }

    return this.isDisabledByCreateOrEditOrDelete(selectedPermissions, entityTypeId, actionTypeId);
  }

  private isDisabledByCreateOrEditOrDelete(selectedPermissions: GroupedAccessPolicyPermissions, entityTypeId: number, actionTypeId: PermissionActionTypeEnum){
    if (actionTypeId !== PermissionActionTypeEnum.Read || !this.isPermissionChecked(selectedPermissions, entityTypeId, actionTypeId)) {
      return false;
    }
    const canUpdate = this.isPermissionChecked(selectedPermissions, entityTypeId, PermissionActionTypeEnum.Edit);
    const canCreate = this.isPermissionChecked(selectedPermissions, entityTypeId, PermissionActionTypeEnum.Create);
    const canDelete = this.isPermissionChecked(selectedPermissions, entityTypeId, PermissionActionTypeEnum.Delete);
    return canUpdate || canCreate || canDelete;
  }

  public isPermissionExist(allPermissions: GroupedPermissions, entityTypeId: number, actionTypeId: number): boolean {
    const entityPermissions = allPermissions[entityTypeId] as PermissionV2[];

    return !!entityPermissions?.find(p => p.entityType.id === entityTypeId && p.actionType.id === actionTypeId);
  }

  private updatePermissions(permissionsPerEntityType: PermissionV2[], entityTypeId: number, actionTypeId: PermissionActionTypeEnum, checked: boolean) {
    const targetPermission = this.findPermissionByActionType(permissionsPerEntityType, entityTypeId, actionTypeId);
    if (checked) {
      switch (actionTypeId) {
        case PermissionActionTypeEnum.Create:
        case PermissionActionTypeEnum.Edit:
        case PermissionActionTypeEnum.Delete: {
          const readPermission = this.findPermissionByActionType(permissionsPerEntityType, entityTypeId, PermissionActionTypeEnum.Read);
          if (readPermission) {
            this.store.dispatch(accessPoliciesActions.AddPermissionToSelected({ permission: readPermission }));
          }
          break;
        }
        default:
          this.updatePermission(targetPermission, checked);
          break;
      }
    }
    this.updatePermission(targetPermission, checked);

    const dependenciesPermissions = this.getDependenciesPermissions(entityTypeId, actionTypeId);
    if (dependenciesPermissions.length > 0 && checked) {
      this.setDependenciesPermissions(dependenciesPermissions, permissionsPerEntityType, checked);
    }
  }

  private updatePermission(permission: PermissionV2, checked: boolean) {
    if (checked) {
      this.store.dispatch(accessPoliciesActions.AddPermissionToSelected({ permission }));
    } else {
      this.store.dispatch(accessPoliciesActions.RemovePermissionFromSelected({ permission }));
    }
  }

  private getDependenciesPermissions(entityTypeId: number, actionTypeId: PermissionActionTypeEnum) {
    const key = PermissionService.create(entityTypeId, actionTypeId);
    const permissionsDependencies = this.permissionsDependencies.get(key);

    return permissionsDependencies?.depends || [];
  }

  private isDependentPermission(selectedPermissions: GroupedAccessPolicyPermissions, entityTypeId: number, actionTypeId: PermissionActionTypeEnum) {
    let hasActiveDependencies = false;

    const permissionKey = PermissionService.create(entityTypeId, actionTypeId);
    const dependencyValue = this.permissionsDependencies.get(permissionKey);
    const currentPermissionChecked = !!this.isPermissionChecked(selectedPermissions, entityTypeId, actionTypeId);

    if (dependencyValue) {
      dependencyValue.depends.forEach(dependency => {
        const [entityId, actionId] = dependency.split('-');
        const isDependencyPermissionChecked = !!this.isPermissionChecked(selectedPermissions, Number(entityId), Number(actionId));
        if (isDependencyPermissionChecked) {
          hasActiveDependencies = isDependencyPermissionChecked;
        }
      });
    }
    return dependencyValue?.shouldDisableSelectedPerm && hasActiveDependencies && currentPermissionChecked;
  }

  public isDisabledToCheck(selectedPermissions: GroupedAccessPolicyPermissions, entityTypeId: number, actionTypeId: PermissionActionTypeEnum )
  {
    const permissionKey = PermissionService.create(entityTypeId, actionTypeId);
    const dependencies = this.permissionsDependencies.get(permissionKey);
    let hasDisabledDependency = false;

    // If there are dependencies with shouldDisableSelectedPerm set to true,
    // check if any of those are disabled in the selected permissions
    if (dependencies?.shouldDisableSelectedPerm) {
      hasDisabledDependency = (dependencies.depends.some(dependency => {
        const [entityId, actionId] = dependency.split('-').map(Number);
        return this.isDisabledByCreateOrEditOrDelete(selectedPermissions, entityId, actionId);}));
    }

    return hasDisabledDependency || this.isDisabledByCreateOrEditOrDelete(selectedPermissions, entityTypeId, actionTypeId);
  }

  private setDependenciesPermissions(dependenciesPermissions: string[], permissionsPerEntityType: PermissionV2[], checked: boolean) {
    dependenciesPermissions.forEach((permission: string) => {
      const [entityTypeId, actionTypeId] = permission.split('-');
      const targetPermission = this.findPermissionByActionType(permissionsPerEntityType, Number(entityTypeId), Number(actionTypeId));
      if (targetPermission) {
        this.updatePermission(targetPermission, checked);
      }
    });
  }

  private addDependentPermission(allPermissions: GroupedPermissions, entityTypeId: PermissionTypeEnum, checked: boolean) {
    const permissionsPerEntityType = allPermissions[entityTypeId] as PermissionV2[];
    const targetPermission = this.findPermissionByActionType(permissionsPerEntityType, entityTypeId, PermissionActionTypeEnum.Read);
    if (checked) {
      this.store.dispatch(accessPoliciesActions.AddPermissionToSelected({ permission: targetPermission }));
    }
  }

  protected abstract findPermissionByActionType(permissionsPerEntityType: PermissionV2[], entityTypeId: number, actionTypeId: PermissionActionTypeEnum): PermissionV2;
}
