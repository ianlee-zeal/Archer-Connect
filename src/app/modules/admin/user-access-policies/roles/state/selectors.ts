import { createSelector, createFeatureSelector } from '@ngrx/store';
import { OrganizationRoleState } from './reducers';

const featureSelector = createFeatureSelector<OrganizationRoleState>('org-roles_feature');

export const error = createSelector(featureSelector, state => state.error);
export const agGridParams = createSelector(featureSelector, state => state.agGridParams);
export const orgRole = createSelector(featureSelector, state => state.orgRole);
export const orgRoleDetailsHeader = createSelector(featureSelector, state => state.orgRoleDetailsHeader);
export const actionBar = createSelector(featureSelector, state => state.actionBar);
export const orgRoles = createSelector(featureSelector, state => state.orgRoles);
