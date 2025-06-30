/* eslint-disable @typescript-eslint/no-use-before-define */
import { createReducer, on, Action } from '@ngrx/store';

import { Org, User, UserInfo } from '@app/models';
import * as authActions from './auth.actions';

export interface DuoState {
  host: string;
  sigRequest: string;
  username: string;
}

export interface IAuthState {
  user: UserInfo;
  errorMessage: string;
  successfulMessage: string;
  pending: boolean;
  duo: DuoState;
  selectedOrganization: Org;
  isLoginPending: boolean;
  userDetails: User;
  isLoggingOut: boolean;
}

const initialState: IAuthState = {
  user: null,
  errorMessage: null,
  successfulMessage: null,
  pending: false,
  duo: null,
  selectedOrganization: null,
  isLoginPending: null,
  userDetails: null,
  isLoggingOut: false,
};

// main reducer function
export const authReducer = createReducer(
  initialState,
  on(authActions.AuthLoginComplete, (state, { user }) => ({ ...state, user, isLoginPending: false, isLoggingOut: false })),
  on(authActions.AuthLogout, (state, { errorMessage }) => authLogoutReducer(state, errorMessage)),
  on(authActions.AuthError, (state, { errorMessage }) => ({ ...state, errorMessage, pending: false })),

  on(authActions.SelectOrganization, (state, { id }) => ({
    ...state,
    user: {
      ...state.user,
      permissions: [],
      selectedOrganization: state.user.organizations.find(org => org.id === id),
    },
  })),

  on(authActions.GetUserPermissionsComplete, (state, { permissions }) => ({
    ...state,
    user: { ...state.user, permissions },
  })),

  on(authActions.UpdateUserTimezone, (state, { timezone }) => ({ ...state, user: { ...state.user, timezone } })),

  on(authActions.LoginRedirect, state => ({ ...state, pending: false, isLoginPending: true })),
  on(authActions.GetUserInfo, state => ({ ...state, errorMessage: null, successfulMessage: null, pending: true })),
  on(authActions.GetUserInfoCompleted, (state, { user }) => ({ ...state, user, pending: false })),
  on(authActions.ResetState, state => ({ ...state, errorMessage: null, successfulMessage: null, pending: false, user: null })),
  on(authActions.GetUserDetailsCompleted, (state, { user }) => ({ ...state, userDetails: user })),
);

// we have to wrap our reducer like this or it won't compile in prod
export function reducer(state: IAuthState | undefined, action: Action) {
  return authReducer(state, action);
}

/**
 * Reducer function for logout action
 *
 * @param {IAuthState} state - current state
 * @param {string} errorMessage - error message
 * @returns
 */
function authLogoutReducer(state: IAuthState, errorMessage: string) {
  return { ...state, user: null, errorMessage, pending: false, isLoggingOut: true };
}
