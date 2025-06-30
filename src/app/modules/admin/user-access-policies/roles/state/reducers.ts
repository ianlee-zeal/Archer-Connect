import { createReducer, on, Action } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { OrgRole } from '@app/models/org-role';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import * as actions from './actions';

export interface OrganizationRoleState {
  error: string | undefined,
  pending: boolean,
  agGridParams: IServerSideGetRowsParamsExtended,
  orgRoles: OrgRole[],
  orgRole: OrgRole,
  orgRoleDetailsHeader: OrgRole,
  actionBar: ActionHandlersMap,
}

const initialState: OrganizationRoleState = {
  error: undefined,
  pending: false,
  agGridParams: null,
  orgRoles: null,
  orgRole: null,
  orgRoleDetailsHeader: null,
  actionBar: null,
};

const organizationRoleReducer = createReducer(
  initialState,
  on(actions.Error, (state, { errorMessage }) => ({ ...state, error: errorMessage })),
  on(actions.CreateOrganizationRoleError, (state, { error }) => ({ ...state, error })),

  on(actions.GetOrganizationRolesRequest, (state, { agGridParams }) => ({
    ...state, pending: true, error: null, agGridParams,
  })),
  on(actions.GetOrganizationRolesSuccess, (state, { orgRoles }) => ({ ...state, pending: false, orgRoles })),
  on(actions.GetOrganizationRolesError, (state, { errorMessage }) => ({ ...state, pending: false, error: errorMessage })),

  on(actions.GetOrganizationRoleDetailsRequest, state => ({ ...state, pending: true, error: null, orgRole: null, orgRoleDetailsHeader: null })),
  on(actions.GetOrganizationRoleDetailsSuccess, (state, { orgRole }) => ({ ...state, pending: false, error: null, orgRole, orgRoleDetailsHeader: orgRole })),
  on(actions.GetOrganizationRoleDetailsError, (state, { errorMessage }) => ({ ...state, pending: false, error: errorMessage })),

  on(actions.UpdateOrgRoleActionBar, (state, { actionBar }) => ({ ...state, actionBar })),

  on(actions.UpdateOrgRoleFormState, (state, { orgRole }) => ({ ...state, orgRole: { ...state.orgRole, ...orgRole } })),

  on(actions.SaveOrgRoleSuccess, (state, { orgRole }) => ({ ...state, orgRole, orgRoleDetailsHeader: orgRole })),

  on(actions.ClearError, state => ({ ...state, error: undefined })),
);

export function OrganizationRoleReducer(state: OrganizationRoleState | undefined, action: Action) {
  return organizationRoleReducer(state, action);
}
