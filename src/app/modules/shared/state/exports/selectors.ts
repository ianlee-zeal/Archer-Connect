import { createFeatureSelector, createSelector } from '@ngrx/store';

import { SharedModuleState, FEATURE_NAME } from '../shared.state';

const sharedFeature = createFeatureSelector<SharedModuleState>(FEATURE_NAME);
const exportsSelector = createSelector(sharedFeature, state => state.exports);
const actionBarSelector = createSelector(sharedFeature, state => state.exports);

export const exportsSelectors = {
  isExporting: createSelector(exportsSelector, state => state.isExporting),
  isActionInProgress: createSelector(exportsSelector, state => state.isActionInProgress),
  actionBar: createSelector(actionBarSelector, state => state.actionBar),
};
