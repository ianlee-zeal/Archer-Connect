import { createAction, props } from '@ngrx/store';
import { OrganizationRoleUser } from '@app/models/organization-role-user';

export const Error = createAction('[Shared User Roles List] User Roles API Error', props<{ errorMessage: string }>());
export const GetUserRolesListRequest = createAction('[Shared User Roles List] Get User Roles Request', props<{ userId: number }>());
export const GetUserRolesListRequestComplete = createAction('[Shared User Roles List] Get User Roles Request Complete', props<{ userRolesList: OrganizationRoleUser[] }>());
