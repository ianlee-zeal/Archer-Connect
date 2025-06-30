/* NgRx */
import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromAuth from './auth.reducer';
import * as fromRoot from '../../../state';

export enum AuthModuleFeatures {
  authFeature = 'auth_feature',
}

// Extends the app state to include the product feature.
// This is required because products are lazy loaded.
// So the reference to ProductState cannot be added to app.state.ts directly.
export interface AppState extends fromRoot.AppState {
  [AuthModuleFeatures.authFeature]: fromAuth.IAuthState;
}

// State selectors
const authFeature = createFeatureSelector<fromAuth.IAuthState>(AuthModuleFeatures.authFeature);

const successfulMessage = createSelector(
  authFeature,
  state => state.successfulMessage,
);
const getUser = createSelector(
  authFeature,
  state => state.user,
);

const getUserName = createSelector(
  authFeature,
  state => state.user?.username,
);

const errorMessage = createSelector(
  authFeature,
  state => state.errorMessage,
);
const authPending = createSelector(
  authFeature,
  state => state.pending,
);
const loggedIn = createSelector(
  getUser,
  user => !!user,
);
const isLoginPending = createSelector(
  authFeature,
  state => state.isLoginPending,
);
const getDuoConfig = createSelector(authFeature, state => state && state.duo);
const selectedOrganization = createSelector(getUser, state => state && state.selectedOrganization);
const getUserDetails = createSelector(authFeature, state => state.userDetails);
const permissions = createSelector(getUser, state => state && state.permissions);
const isLoggingOut = createSelector(authFeature, state => state.isLoggingOut);
const isCurrentOrgMaster = createSelector(getUser, state => state?.selectedOrganization?.isMaster);

export const authSelectors = {
  getUser,
  getUserName,
  errorMessage,
  successfulMessage,
  pending: authPending,
  loggedIn,
  getDuoConfig,
  selectedOrganization,
  permissions,
  isLoginPending,
  getUserDetails,
  isLoggingOut,
  isCurrentOrgMaster,
};
