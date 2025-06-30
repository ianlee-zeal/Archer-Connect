import { Injectable } from '@angular/core';

import { PermissionV2 } from '@app/models';
import { PermissionTypeEnum, PermissionActionTypeEnum } from '@app/models/enums';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  //
  // Set of string is used to increase check performance.
  // It works way much faster than an array of PermissionV2 objects.
  // Time complexity O(1) vs O(n)
  //
  private permissionSet: Set<string> = new Set();

  public set(permissions: PermissionV2[]) {
    this.clear();
    this.add(permissions);
  }

  public clear() {
    this.permissionSet.clear();
  }

  public has(permissions: string | string[]): boolean {
    // If no permissions have been set for the element == has permissions
    if (!permissions) {
      return true;
    }

    return Array.isArray(permissions)
      ? permissions.every(permission => this.permissionSet.has(permission))
      : this.permissionSet.has(permissions);
  }

  public hasAny(permissions: string | string[]): boolean {
    if (!permissions) {
      return true;
    }

    return Array.isArray(permissions)
      ? permissions.some(permission => this.permissionSet.has(permission))
      : this.permissionSet.has(permissions);
  }

  public canRead(permission: PermissionTypeEnum): boolean {
    return this.has(PermissionService.create(permission, PermissionActionTypeEnum.Read));
  }

  public canCreate(permission: PermissionTypeEnum): boolean {
    return this.has(PermissionService.create(permission, PermissionActionTypeEnum.Create));
  }

  public canEdit(permission: PermissionTypeEnum): boolean {
    return this.has(PermissionService.create(permission, PermissionActionTypeEnum.Edit));
  }

  public canDelete(permission: PermissionTypeEnum): boolean {
    return this.has(PermissionService.create(permission, PermissionActionTypeEnum.Delete));
  }

  public static create(entity: PermissionTypeEnum, action: PermissionActionTypeEnum): string {
    return `${entity}-${action}`;
  }

  private add(permissions: PermissionV2[]) {
    if (!permissions) {
      return;
    }

    for (const p of permissions) {
      const permission = PermissionService.create(p.entityType.id, p.actionType?.id);
      this.permissionSet.add(permission);
    }
  }
}
