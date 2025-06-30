import { PermissionV2 } from './permission-v2';
import { PermissionActionTypeEnum } from './enums/permission-action-type.enum';

export class GroupedAccessPolicyPermissions {
  public static toModel(perms: PermissionV2[]): GroupedAccessPolicyPermissions {
    const permissions = new Map<number, Map<number, PermissionActionTypeEnum>>();

    if (perms) {
      perms.forEach(permission => {
        const entityTypeId = permission.entityType.id;

        if (!permissions[entityTypeId]) {
          permissions[entityTypeId] = {};
        }

        const permissionModel = PermissionV2.toModel(permission);
        permissions[entityTypeId][permission.actionType.id] = permissionModel;
      });
    }

    return permissions;
  }

  public static toDto(permissions: GroupedAccessPolicyPermissions): PermissionV2[] {
    const result: PermissionV2[] = [];

    // TODO check API for actionType value
    if (permissions) {
      Object.keys(permissions).forEach((entityId: string) => {
        Object.keys(permissions[entityId]).forEach((actionTypeId: string) => {
          result.push(permissions[entityId][actionTypeId]);
        });
      });
    }

    return result;
  }
}
