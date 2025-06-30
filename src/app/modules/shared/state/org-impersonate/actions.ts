import { createAction, props } from '@ngrx/store';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { OrgImpersonateRequest } from '@app/models/org-impersonate-request';
import { IServerSideGetRowsRequestExtended } from '../../_interfaces/ag-grid/ss-get-rows-request';

const featureName = '[org_impersonate_feature]';

export const GetOrgsOptionsRequest = createAction(`${featureName} Get Orgs Options Request`, props<{ search?: IServerSideGetRowsRequestExtended }>());
export const GetOrgsOptionsSuccess = createAction(`${featureName} Get Orgs Options Complete`, props<{ orgsOptions: SelectOption[] }>());
export const GetOrgsOptionsError = createAction(`${featureName} Get Orgs Options Error`, props<{ error: any }>());
export const ClearOrgsOptions = createAction(`${featureName} Clear Selected Org Complete`);

export const GetRolesOptionsRequest = createAction(`${featureName} Get Roles Options Request`, props<{ orgId: number }>());
export const GetRolesOptionsSuccess = createAction(`${featureName} Get Roles Options Complete`, props<{ rolesOptions: SelectOption[] }>());
export const GetRolesOptionsError = createAction(`${featureName} Get Roles Options Error`, props<{ error: any }>());

export const ImpersonateOrgRequest = createAction(`${featureName} Impersonate Org Request`, props<{ impersonateRequest: OrgImpersonateRequest }>());
export const ImpersonateOrgRequestComplete = createAction(`${featureName} Impersonate Org Request`, props <{ success: boolean }>());
export const ImpersonateOrgRequestError = createAction(`${featureName} Impersonate Org Request Error`, props<{ error: any }>());

export const DepersonateOrgRequest = createAction(`${featureName} Depersonate Org Request`);
export const DepersonateOrgRequestComplete = createAction(`${featureName} Depersonate Org Request`, props <{ success: boolean }>());
export const DepersonateOrgRequestError = createAction(`${featureName} Depersonate Org Request Error`, props<{ error: any }>());
