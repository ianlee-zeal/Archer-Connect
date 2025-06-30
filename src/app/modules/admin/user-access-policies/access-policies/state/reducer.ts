import { createReducer, Action, on } from '@ngrx/store';

import { GroupedAccessPolicyPermissions } from '@app/models/grouped-access-policy-permissions';
import { PermissionV2 } from '@app/models';
import { AccessPoliciesState, accessPoliciesInitialState } from './state';
import * as accessPoliciesActions from './actions';

export const Reducer = createReducer(
  accessPoliciesInitialState,

  on(accessPoliciesActions.GetAccessPolicies, () => ({ ...accessPoliciesInitialState, error: null })),
  on(accessPoliciesActions.GetAccessPoliciesComplete, (state, { data }) => ({ ...state, index: data[0] })),

  on(accessPoliciesActions.GetAccessPolicy, state => ({ ...state, item: null, itemHeader: null, orgId: null, error: null })),
  on(accessPoliciesActions.GetAccessPolicyComplete, (state, { data }) => ({ ...state, item: data, itemHeader: data })),

  on(accessPoliciesActions.GetAllPermissionsComplete, (state, { permissions, entityTypes }) => ({ ...state, allPermissions: permissions, entityTypes })),

  on(accessPoliciesActions.GetActionTypes, state => ({ ...state, actionTypes: null, error: null })),
  on(accessPoliciesActions.GetActionTypesComplete, (state, { actionTypes }) => ({ ...state, actionTypes })),

  on(accessPoliciesActions.Error, (state, { error }) => ({ ...state, error })),
  on(accessPoliciesActions.AddAccessPolicyError, (state, { error }) => ({ ...state, error })),
  on(accessPoliciesActions.ClearError, state => ({ ...state, error: null })),

  on(accessPoliciesActions.UpdateAccessPolicyRequest, (state, { item }) => ({ ...state, item })),
  on(accessPoliciesActions.UpdateAccessPolicySuccess, (state, { accessPolicy }) => ({ ...state, itemHeader: accessPolicy, item: accessPolicy })),

  on(accessPoliciesActions.AddPermissionToSelected, (state, { permission }) => ({
    ...state,
    selectedPermissions:
      GroupedAccessPolicyPermissions.toModel([
        ...GroupedAccessPolicyPermissions.toDto(state.selectedPermissions),
        permission,
      ]),
  })),

  on(accessPoliciesActions.AddPermissionsToSelected, (state, { permissions }) => ({
    ...state,
    selectedPermissions:
      // filter already selected permissions and replace them with newly selected
      GroupedAccessPolicyPermissions.toModel([
        ...GroupedAccessPolicyPermissions.toDto(state.selectedPermissions).filter(p => permissions.findIndex(i => i.id === p.id) === -1),
        ...permissions,
      ]),
  })),

  on(accessPoliciesActions.RemovePermissionsFromSelected, (state, { permissions }) => ({
    ...state,
    selectedPermissions:
      GroupedAccessPolicyPermissions.toModel(
        GroupedAccessPolicyPermissions.toDto(state.selectedPermissions).filter(p => permissions.findIndex(i => i.id === p.id) === -1),
      ),
  })),

  on(accessPoliciesActions.ResetSelectedPermissionsSuccess, (state, { permissions }) => ({ ...state, selectedPermissions: permissions })),
  on(accessPoliciesActions.RemovePermissionFromSelected, (state, { permission }) => ({
    ...state,
    selectedPermissions: GroupedAccessPolicyPermissions.toModel(
      GroupedAccessPolicyPermissions.toDto(state.selectedPermissions).filter((perm: PermissionV2) => perm.id !== permission.id),
    ),
  })),

  on(accessPoliciesActions.UpdateAccessPolicyOrgId, (state, { orgId }) => ({ ...state, orgId })),

  on(accessPoliciesActions.UpdateAccessPoliciesActionBar, (state, { actionBar }) => ({ ...state, actionBar })),
);

// we have to wrap our reducer like this or it won't compile in prod
export function reducer(state: AccessPoliciesState | undefined, action: Action) {
  return Reducer(state, action);
}
