import { createAction, props } from '@ngrx/store';
import { PermissionV2, User, UserInfo } from '@app/models';
import { TimeZone } from '../../../models/time-zone';

export const AuthLoginComplete = createAction('[Auth] Submit Login Complete', props<{ user: UserInfo }>());
export const AuthLogout = createAction('[Auth] Log out', (errorMessage: string = null) => ({ errorMessage }));
export const AuthError = createAction('[Auth] Error Message', props<{ errorMessage: string }>());

export const SelectOrganization = createAction('[Auth] Select Organization', props<{ id: number }>());
export const SelectOrganizationComplete = createAction('[Auth] Select Organization Complete');
export const LoginRedirect = createAction('[Auth] Login Redirect');

export const GetUserInfo = createAction('[Auth] Get User Info');
export const GetUserInfoCompleted = createAction('[Auth] Get User Info Completed', props<{ user: UserInfo }>());

export const GetUserPermissions = createAction('[Auth] GetUserPermissions', props<{ user: UserInfo }>());
export const GetUserPermissionsComplete = createAction('[Auth] Get Current User Permissions Complete', props<{ permissions: PermissionV2[] }>());
export const RestorePermissions = createAction('[Auth] Restore Permissions');

export const GetUserDetails = createAction('[Auth] Get User Details', props<{ id: number }>());
export const GetUserDetailsCompleted = createAction('[Auth] Get User Details Completed', props<{ user: User }>());

export const UpdateUserTimezone = createAction('[Auth] Update User Timezone', props<{ timezone: TimeZone }>());

export const ResetState = createAction('[Auth] Reset State');
