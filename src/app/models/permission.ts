import { PermissionType } from "./permission-type";
import { PermissionEntity } from "./permission-entity";

export class Permission {
  id: number;
  permissionTypeId: number;
  permissionType: PermissionType;
  entityId: number;
  entity: PermissionEntity;
  action: string;
  description: string;
  displayOrder: number;
}
