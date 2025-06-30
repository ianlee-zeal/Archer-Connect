import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { OrgRole } from '@app/models/org-role';
import { NavigationSettings } from '@app/modules/shared/action-bar/navigation-settings';
import { RoleLevelEnum } from '@app/models/enums/role-level.enum';

const featureName = '[Organization Role List]';
export const Error = createAction(`${featureName} API Error`, props<{ errorMessage: string }>());

export const GetOrganizationRolesRequest = createAction(`${featureName} Get Organization Role List Request`, props<{ agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetOrganizationRolesSuccess = createAction(`${featureName} Get Organization Role List Success`, props<{ orgRoles: OrgRole[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const GetOrganizationRolesError = createAction(`${featureName} Get Organization Role List Error`, props<{ errorMessage: string; agGridParams: IServerSideGetRowsParamsExtended }>());

export const DeleteOrganizationRolesRequest = createAction(`${featureName} Delete Request`, props<{ ids: number[], orgId: number, callback: Function }>());
export const DeleteOrganizationRolesSuccess = createAction(`${featureName} Delete Success`, props<{ orgId: number }>());

export const GetOrganizationRoleDetailsRequest = createAction(`${featureName} Get Organization Role Details Request`, props<{ id: number }>());
export const GetOrganizationRoleDetailsSuccess = createAction(`${featureName} Get Organization Role Details Success`, props<{ orgRole: OrgRole }>());
export const GetOrganizationRoleDetailsError = createAction(`${featureName} Get Organization Role Details Error`, props<{ errorMessage: string }>());

export const UpdateOrgRoleActionBar = createAction(`${featureName} Update Org Role Action Bar`, props<{ actionBar: ActionHandlersMap }>());

export const SaveOrgRoleRequest = createAction(`${featureName} Save Org Role Request`, props<{ callback:() => void }>());
export const SaveOrgRoleSuccess = createAction(`${featureName} Save Org Role Success`, props<{ orgRole: OrgRole }>());

export const UpdateOrgRoleFormState = createAction(`${featureName} Update Org Role Form State`, props<{ orgRole: any }>());

export const GoToOrgRolesPage = createAction(`${featureName} Go to Org Roles Page`);
export const GoToOrgRole = createAction(`${featureName} Go to Org Roles`, props<{ id: number, navSettings: NavigationSettings }>());

export const CreateOrganizationRoleRequest = createAction(`${featureName} Create New Org Role Request`, props<{ name: string, accessPolicyId: number, orgId: number, level: RoleLevelEnum, modal: BsModalRef }>());
export const CreateOrganizationRoleSuccess = createAction(`${featureName} Create New Org Role Success`, props<{ id: number, orgId: number, modal: BsModalRef }>());
export const CreateOrganizationRoleError = createAction(`${featureName} Create New Org Role Failed`, props<{ error: string }>());

export const ClearError = createAction(`${featureName} Clear Error`);
