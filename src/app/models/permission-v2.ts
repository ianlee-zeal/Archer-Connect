import { EntityType } from './entity-type';
import { PermissionActionType } from './permission-action-type';

// TODO: remove postfix V2 when we can remove old permission class
export class PermissionV2 {
  id: number;
  entityType: EntityType;
  actionType: PermissionActionType;

  public static toModel(item: any): PermissionV2 {
    if (!item) {
      return null;
    }

    return {
      id: item.id,
      entityType: item.entityType,
      actionType: item.actionType,
    };
  }
}
