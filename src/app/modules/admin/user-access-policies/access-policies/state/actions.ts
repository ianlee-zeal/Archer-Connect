import { createAction, props } from '@ngrx/store';

import { EntityType } from '@app/models/entity-type';
import { AccessPolicy } from '@app/models/access-policy';
import { GroupedPermissions } from '@app/models/grouped-permissions';
import { PermissionV2, PermissionActionType } from '@app/models';
import { NavigationSettings } from '@app/modules/shared/action-bar/navigation-settings';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { GroupedAccessPolicyPermissions } from '@app/models/grouped-access-policy-permissions';

const FEATURE_NAME = '[Admin-User-Access-Policies]';

export const Error = createAction(`${FEATURE_NAME} Api Error`, props<{ error: string }>());
export const AddAccessPolicyError = createAction(`${FEATURE_NAME} Add Access Policy Error`, props<{ error: string }>());
export const ClearError = createAction(`${FEATURE_NAME} Clear Error`);
export const UpdateAccessPoliciesActionBar = createAction(`${FEATURE_NAME} Update Access Policies Action Bar`, props<{ actionBar: ActionHandlersMap }>());

export const GetAccessPolicies = createAction(`${FEATURE_NAME} Get Access Policies`, props<{ orgId: number }>());
export const GetAccessPoliciesComplete = createAction(`${FEATURE_NAME} Get Access Policies Complete`, props<{ data: any[] }>());

export const GetAccessPolicy = createAction(`${FEATURE_NAME} Get Access Policy`, props<{ id: number }>());
export const GetAccessPolicyComplete = createAction(`${FEATURE_NAME} Get Access Policy Complete`, props<{ data: any }>());

export const GetAllPermissions = createAction(`${FEATURE_NAME} Get All Permissions`);
export const GetAllPermissionsComplete = createAction(`${FEATURE_NAME} Get All Permissions Complete`, props<{ permissions: GroupedPermissions, entityTypes: EntityType[] }>());

export const GetActionTypes = createAction(`${FEATURE_NAME} Get Action Types`);
export const GetActionTypesComplete = createAction(`${FEATURE_NAME} Get Action Types Complete`, props<{ actionTypes: PermissionActionType[] }>());

export const AddAccessPolicyRequest = createAction(`${FEATURE_NAME} Add Access Policy Request`, props<{ item: AccessPolicy; modal: any }>());
export const AddAccessPolicySuccess = createAction(`${FEATURE_NAME} Add Access Policy Success`, props<{ modal: any }>());

export const AddPermissionToSelected = createAction(`${FEATURE_NAME} Add Permission to Selected`, props<{ permission: PermissionV2 }>());
export const AddPermissionsToSelected = createAction(`${FEATURE_NAME} Add Permissions to Selected`, props<{ permissions: PermissionV2[] }>());
export const RemovePermissionFromSelected = createAction(`${FEATURE_NAME} Remove Permission from Selected`, props<{ permission: PermissionV2 }>());
export const RemovePermissionsFromSelected = createAction(`${FEATURE_NAME} Remove Permissions from Selected`, props<{ permissions: PermissionV2[] }>());

export const ResetSelectedPermissions = createAction(`${FEATURE_NAME} Reset Selected Permissions`);
export const ResetSelectedPermissionsSuccess = createAction(`${FEATURE_NAME} Reset Selected Permissions Success`, props<{ permissions: GroupedAccessPolicyPermissions }>());

export const UpdateAdvancedPermissionsRequest = createAction(`${FEATURE_NAME} Update Advanced Permissions Request`, props<{ callback?: () => void }>());
export const ResetAdvancedPermissions = createAction(`${FEATURE_NAME} Reset Advanced Permissions`);

export const UpdateAccessPolicyRequest = createAction(`${FEATURE_NAME} Update Access Policy Request`, props<{ item: AccessPolicy, callback?: () => void }>());
export const UpdateAccessPolicySuccess = createAction(`${FEATURE_NAME} Update Access Policy Success`, props<{ accessPolicy: AccessPolicy }>());
export const UpdateAccessPolicyError = createAction(`${FEATURE_NAME} Update Access Policy Error`, props<{ error: string }>());

export const DeleteAccessPoliciesRequest = createAction(`${FEATURE_NAME} Delete Access Policies Request`, props<{ ids: number[] }>());
export const DeleteAccessPoliciesSuccess = createAction(`${FEATURE_NAME} Delete Access Policies Success`);

export const GotoAccessPolicies = createAction(`${FEATURE_NAME} Goto Access Policies`);
export const GotoAccessPolicy = createAction(`${FEATURE_NAME} Goto Access Policy`, props<{ id: number, navSettings: NavigationSettings }>());

export const UpdateAccessPolicyOrgId = createAction(`${FEATURE_NAME} Update Access Policy Org Id`, props<{ orgId: number }>());
