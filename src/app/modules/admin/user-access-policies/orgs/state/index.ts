import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromUserAccessPoliciesOrgs from './reducer';
import * as fromAdmin from '../../../state/state';
import * as fromAdminR from '../../../state/reducer';

export interface AppState extends fromAdmin.AppState {
  user_access_policies_orgs: fromUserAccessPoliciesOrgs.UserAccessPoliciesOrgsState
}

const selectFeature = createFeatureSelector<fromAdminR.AdminState>('admin_feature');
const userAccessPoliciesOrgs = createSelector(selectFeature, state => state.user_access_policies_orgs);
const userAccessPoliciesOrgsCommon = createSelector(userAccessPoliciesOrgs, state => state.common);

export const index = createSelector(userAccessPoliciesOrgsCommon, state => state.index);
export const item = createSelector(userAccessPoliciesOrgsCommon, state => state.item);
export const orgId = createSelector(userAccessPoliciesOrgsCommon, state => state.id);
export const search = createSelector(userAccessPoliciesOrgsCommon, state => state.search);
export const actionBar = createSelector(userAccessPoliciesOrgsCommon, state => state.actionBar);
export const pending = createSelector(userAccessPoliciesOrgsCommon, state => state.pending);
export const error = createSelector(userAccessPoliciesOrgsCommon, state => state.error);
export const params = createSelector(userAccessPoliciesOrgsCommon, state => state.params);
