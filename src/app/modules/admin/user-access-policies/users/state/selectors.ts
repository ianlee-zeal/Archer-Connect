import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromAdminR from '../../../state/reducer';

const adminFeature = createFeatureSelector<fromAdminR.AdminState>('admin_feature');

export const users = createSelector(adminFeature, state => state.user_access_policies.users);

export const actionBar = createSelector(users, state => state.actionBar);

export const error = createSelector(users, state => state.error);

export const currentUser = createSelector(users, state => state.currentUser);
export const userDetailsHeader = createSelector(users, state => state.userDetailsHeader);
export const currentUserRoles = createSelector(currentUser, state => (state && state.roles && state.roles.length ? state.roles : []));
export const currentUserTeams = createSelector(currentUser, state => (state && state.teams && state.teams.length ? state.teams : []));
export const isCurrentUserValid = createSelector(users, state => state.userDetailsForm && state.userDetailsForm.valid);
export const userDetailsForm = createSelector(users, state => state.userDetailsForm);

export const agGridParams = createSelector(users, state => state.agGridParams);

export const selectedAccessPolicies = createSelector(users, state => state.selectedAccessPolicies);

export const unassignedOrganizationRoles = createSelector(users, state => state.unassignedOrganizationRoles);
export const selectedUserRole = createSelector(users, state => state.selectedUserRole);
export const organizationRoles = createSelector(users, state => state.organizationRoles);

export const teams = createSelector(users, state => state.teams);
