import { createFeatureSelector, createSelector } from '@ngrx/store';

import { SharedModuleState, FEATURE_NAME } from '../shared.state';

const sharedFeature = createFeatureSelector<SharedModuleState>(FEATURE_NAME);
const tabInfoSelector = createSelector(sharedFeature, state => state.tabInfo);

export const tabInfoSelectors = {
  entireState: tabInfoSelector,
  tabsCount: createSelector(tabInfoSelector, state => state.tabsCount),
};
