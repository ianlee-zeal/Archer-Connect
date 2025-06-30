import { createReducer, Action, on } from '@ngrx/store';

import * as usersActions from './actions';
import { UsersState, usersInitialState } from './state';

export const Reducer = createReducer(
  usersInitialState,

  on(usersActions.Error, (state, { error }) => ({ ...state, error, pending: false })),

  on(usersActions.ResetCreateUserState, state => ({ ...state, error: null, pending: false })),
  on(usersActions.GoToOrganizationUsers, state => ({ ...state, currentUser: null, userDetailsHeader: null, userDetailsForm: null })),

  on(usersActions.GetAllUsersActionRequest, state => ({ ...state, index: null, pending: true })),
  on(usersActions.GetAllUsersActionComplete, (state, { users, agGridParams }) => ({ ...state, index: users, pending: false, agGridParams: agGridParams.request })),

  on(usersActions.GetUser, state => ({ ...state, error: null, pending: true })),
  on(usersActions.GetUserCompleted, (state, { user }) => ({ ...state, currentUser: user, userDetailsHeader: user })),
  on(usersActions.UpdateUser, (state, { user, userDetailsForm }) => ({ ...state, currentUser: { ...state.currentUser, ...user }, userDetailsForm })),

  on(usersActions.ResetUser, state => ({ ...state, currentUser: null, userDetailsHeader: null })),
  on(usersActions.SaveUser, state => ({ ...state, pending: true })),
  on(usersActions.SaveUserCompleted, state => ({ ...state, currentUser: { ...state.currentUser }, userDetailsHeader: { ...state.currentUser }, userDetailsForm: null, pending: false })),

  on(usersActions.CreateNewUserRequest, state => ({ ...state, pending: true })),
  on(usersActions.CreateNewUserSuccess, (state, { user }) => ({ ...state, pending: false, organizationRoles: [], currentUser: user })),
  on(usersActions.AfterCreateNewUserRedirect, state => ({ ...state, error: null, pending: false })),

  on(usersActions.SelectAccessPolicies, (state, { accessPolicies }) => ({ ...state, selectedAccessPolices: accessPolicies })),

  on(usersActions.AddRoleToUser, state => ({ ...state, pending: false })),
  on(usersActions.AddRoleToUserCompleted, state => ({ ...state, currentUser: { ...state.currentUser }, unassignedOrganizationRoles: [], error: null })),
  on(usersActions.AddRoleToUserError, state => ({ ...state, unassignedOrganizationRoles: [], pending: false })),
  on(usersActions.AddRoleCanceled, state => ({ ...state, unassignedOrganizationRoles: [], pending: false })),

  on(usersActions.RemoveUserRole, state => ({ ...state, pending: true })),
  on(usersActions.RemoveUserRoleCompleted, state => ({ ...state, currentUser: { ...state.currentUser }, selectedUserRole: null, pending: false })),

  on(usersActions.SelectRole, (state, { role }) => ({ ...state, selectedUserRole: role })),
  on(usersActions.GetUserRoles, state => ({ ...state, pending: true })),
  on(usersActions.GetUserRolesComplete, (state, { roles }) => ({ ...state, currentUser: { ...state.currentUser, roles }, pending: false })),
  on(usersActions.GetUserTeamsComplete, (state, { teams }) => ({ ...state, currentUser: { ...state.currentUser, teams }, pending: false })),
  on(usersActions.GetTeamsComplete, (state, { teams }) => ({ ...state, teams })),

  on(usersActions.GetUnassignedOrganizationRoles, state => ({ ...state, error: null, pending: true })),
  on(usersActions.GetUnassignedOrganizationRolesComplete, (state, { roles }) => ({ ...state, unassignedOrganizationRoles: roles, error: null, pending: false })),
  on(usersActions.GetOrganizationRoles, state => ({ ...state, error: null, pending: true })),
  on(usersActions.GetOrganizationRolesComplete, (state, { roles }) => ({ ...state, organizationRoles: roles, error: null, pending: false })),
  on(usersActions.GetOrganizationRolesForUserCreation, state => ({ ...state, error: null, pending: true })),
  on(usersActions.GetOrganizationRolesForUserCreationComplete, (state, { roles }) => ({ ...state, organizationRoles: roles, error: null, pending: false })),

  on(usersActions.UpdateUsersListActionBar, (state, { actionBar }) => ({ ...state, actionBar })),
);

// we have to wrap our reducer like this or it won't compile in prod
export function reducer(state: UsersState | undefined, action: Action) {
  return Reducer(state, action);
}
