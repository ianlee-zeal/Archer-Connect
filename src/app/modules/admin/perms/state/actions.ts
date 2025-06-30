import { createAction, props } from '@ngrx/store';
import { Permission } from "../../../../models/permission";

export const GetPermissions = createAction("[Admin-Perms] Get Permissions");
export const GetPermissionsCompleted = createAction("[Admin-Perms] Get Permissions Completed", props<{ permissions: Permission[] }>());

export const UpdateCurrentPermission = createAction("[Admin-Perms] Update Current Permission", props<{ permission: Permission }>());
export const CommitCurrentPermission = createAction("[Admin-Perms] Commit Current Permission");
export const CommitCurrentPermissionCompleted = createAction("[Admin-Perms] Commit Current Permission Completed", props<{ permission: Permission }>());

export const RemovePermissions = createAction("[Admin-Perms] Remove Permissions", props<{ permissions: Permission[] }>());
export const RemovePermissionsCompleted = createAction("[Admin-Perms] Remove Permissions Completed");
export const UpdateSearch = createAction("[Admin-Perms] Update Search", props<{ search: any }>());
