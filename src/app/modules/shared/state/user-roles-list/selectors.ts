import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SharedModuleState, FEATURE_NAME } from '../shared.state';

const sharedFeature = createFeatureSelector<SharedModuleState>(FEATURE_NAME);
const userRolesListSelector = createSelector(sharedFeature, state => state.userRolesList);

export const userRolesListSelectors = {
  entireState: userRolesListSelector,
  userRolesList: createSelector(userRolesListSelector, state => state.userRolesList),
};
