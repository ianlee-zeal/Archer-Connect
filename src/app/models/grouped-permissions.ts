import { PermissionV2 } from './permission-v2';
import { EntityType } from './entity-type';

export class GroupedPermissions {
  constructor(permissions: PermissionV2[], entityTypes: EntityType[]) {
    const entityTypesMap = this.createEntityTypesMap(entityTypes);

    permissions.forEach(permission => {
      const entityTypeId = permission.entityType.id;
      const entityTypeParent = entityTypesMap[entityTypeId] && entityTypesMap[entityTypeId].parent;

      // child permission has to be added in the parent list
      if (entityTypeParent) {
        this.pushPermission(entityTypeParent.id, permission);
      }

      this.pushPermission(entityTypeId, permission);
    });
  }

  private pushPermission(entityTypeId: number, permission): void {
    if (!this[entityTypeId]) {
      this[entityTypeId] = [];
    }

    this[entityTypeId].push(permission);
  }

  private createEntityTypesMap(entityTypes: EntityType[]): Map<number, EntityType> {
    const map = new Map<number, EntityType>();

    entityTypes.forEach(entityType => {
      map[entityType.id] = entityType;
    });

    return map;
  }
}
