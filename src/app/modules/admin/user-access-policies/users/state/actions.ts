import { UntypedFormGroup } from '@angular/forms';
import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import * as Models from '@app/models';
import { OrganizationRole } from '@app/models/organization-role';
import { NavigationSettings } from '@app/modules/shared/action-bar/navigation-settings';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { TeamToUser } from '@app/models/team-to-user';
import { IdValue } from '@app/models';
import { OrganizationRoleUser } from '../../../../../models/organization-role-user';
import { CreateUserRequest } from '../../../../../models/users/create-user.request';
import { MultipleOrganizationRoleUserRequest } from '@app/models/Multipleorganization-Role-Users';

export const Error = createAction('[Admin-User-Access-Policies] API Error', props<{ error: any }>());
export const UpdateUsersListActionBar = createAction('[Admin-User-Access-Policies] Update Users List Action Bar', props<{ actionBar: ActionHandlersMap }>());
export const ResetUser = createAction('[Admin-User-Access-Policies] Reset User');

export const GetUser = createAction('[Admin-User-Access-Policies] Get User', props<{ id: number }>());
export const GetUserCompleted = createAction('[Admin-User-Access-Policies] Get User Completed', props<{ user: Models.User }>());

export const UpdateUser = createAction('[Admin-User-Access-Policies] Update User', props<{ user: Models.User; userDetailsForm: UntypedFormGroup }>());

export const SaveUser = createAction('[Admin-User-Access-Policies] Save User');
export const SaveUserCompleted = createAction('[Admin-User-Access-Policies] Save User Completed');

export const RemoveUserRole = createAction('[Admin-User-Access-Policies] Remove User Role', props<{ role: OrganizationRoleUser }>());
export const RemoveUserRoleCompleted = createAction('[Admin-User-Access-Policies] Remove User Role Completed');

export const AddRoleToUser = createAction('[Admin-User-Roles] Add Role To User', props<{ roles: MultipleOrganizationRoleUserRequest }>());
export const AddRoleToUserCompleted = createAction('[Admin-User-Roles] Add Role To User Completed');
export const AddRoleToUserError = createAction('[Admin-User-Roles] Add Role To User Error');
export const AddRoleCanceled = createAction('[Admin-User-Roles] Add Role To User Canceled');

export const SelectRole = createAction('[Admin-User-Roles] Select Role to Delete', props<{ role: OrganizationRoleUser }>());
export const GetUserRoles = createAction('[Admin-User-Roles] Get User Roles');
export const GetUserRolesComplete = createAction('[Admin-User-Roles] Get User Roles Complete', props<{ roles: OrganizationRole[] }>());

export const GoToOrganizationUsers = createAction('[Admin-User-Access-Policies] Goto Organization Users', props<{ organizationId: number }>());
export const SelectAccessPolicies = createAction('[Admin-User-Access-Policies] Select Access Policies', props<{ accessPolicies: Models.IdValue[] }>());

// ************************************************* User Page ********************************************************************
export const GetAllUsersActionRequest = createAction('[Admin-Users] Get All Users Request', props<{ params: any }>());
export const GetAllUsersActionComplete = createAction('[Admin-Users] Get All Users Complete', props<{ users: Models.User[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const GetAllUsersActionError = createAction('[Admin-Users] Get All Users Error', props<{ errorMessage: string, agGridParams: IServerSideGetRowsParamsExtended }>());

export const CreateNewUserRequest = createAction('[Admin-User] Create a new User Request', props<{ user: CreateUserRequest; successCallback: any }>());
export const CreateNewUserSuccess = createAction('[Admin-User] Create a new User Success', props<{ user: Models.User }>());
export const CreateNewUserError = createAction('[Admin-User] Create a new User Error', props<{ error: string }>());

export const ResetCreateUserState = createAction('[Admin-User] Reset User State');
export const GotoUserProfile = createAction('[Admin-User] Goto User Profile', props<{ userId: number, navSettings: NavigationSettings }>());
export const AfterCreateNewUserRedirect = createAction('[Admin-User] After Create New User Redirect', props<{ userId: number }>());

export const ResendActivationEmailRequest = createAction('[Admin-User] Resend Activation Email Request', props<{ userId: number }>());
export const ResendActivationEmailSuccess = createAction('[Admin-User] Resend Activation Email Success', props<{ userId: number }>());
export const ResendActivationEmailError = createAction('[Admin-User] Resend Activation Email Error', props<{ userId: number }>());

export const DeleteUserRequest = createAction('[Admin-User] Delete User Request', props<{ userId: number, organizationId: number }>());
export const DeleteUserSuccess = createAction('[Admin-User] Delete User Success', props<{ userId: number }>());
export const DeleteUserError = createAction('[Admin-User] Delete User Error', props<{ userId: number }>());

export const UnlockUserRequest = createAction('[Admin-User] Unlock User Request', props<{ userId: number }>());
export const UnlockUserSuccess = createAction('[Admin-User] Unlock User Success');
export const UnlockUserError = createAction('[Admin-User] Unlock User Error');

export const ResetMFARequest = createAction('[Admin-User] Reset MFA Request', props<{ userId: string }>());
export const ResetMFASuccess = createAction('[Admin-User] Reset MFA Success');

// Organization Roles
export const GetUnassignedOrganizationRoles = createAction('[Admin-User-Roles] Get Unassigned Organization Roles', props<{ orgId: number }>());
export const GetUnassignedOrganizationRolesComplete = createAction('[Admin-User-Roles] Get Unassigned Organization Roles Complete', props<{ roles: OrganizationRole[] }>());
export const GetOrganizationRoles = createAction('[Admin-User-Roles] Get Organization Roles', props<{ orgId: number }>());//GetOrganizationRoles with Roles.Read Permission
export const GetOrganizationRolesComplete = createAction('[Admin-User-Roles] Get Organization Roles Complete', props<{ roles: OrganizationRole[] }>());
export const GetOrganizationRolesForUserCreation = createAction('[Admin-User-Roles] Search Organization Roles', props<{ orgId: number }>()); //GetOrganizationRoles with User.Create Permission
export const GetOrganizationRolesForUserCreationComplete = createAction('[Admin-User-Roles] Search Organization Roles Complete', props<{ roles: OrganizationRole[] }>());

// Teams
export const GetUserTeams = createAction('[Admin-User-Teams] Get User Teams', props<{ userId: number }>());
export const GetUserTeamsComplete = createAction('[Admin-User-Teams] Get User Teams Complete', props<{ teams: TeamToUser[] }>());

export const GetTeams = createAction('[Admin-User-Teams] Get Teams');
export const GetTeamsComplete = createAction('[Admin-User-Teams] Get Teams Complete', props<{ teams: IdValue[] }>());

export const CreateOrUpdateUserTeamRequest = createAction('[Admin-User-Teams] Create Or Update User Team Request', props<{ team: TeamToUser, reassign: boolean }>());
export const CreateOrUpdateUserTeamSuccess = createAction('[Admin-User-Teams] Create Or Update User Team Success', props<{ team: TeamToUser }>());
export const CreateOrUpdateUserTeamError = createAction('[Admin-User-Teams] Create Or Update User Error', props<{ error: string }>());

export const ShowConfirmationDialogForUserTeamRequest = createAction('[Admin-User-Teams] Show Confirmation Dialog For User Team Request', props<{ team: TeamToUser }>());
