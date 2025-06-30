import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SharedModuleState, FEATURE_NAME } from '../shared.state';

const sharedFeature = createFeatureSelector<SharedModuleState>(FEATURE_NAME);
const actionsLogSelector = createSelector(sharedFeature, state => state.actionsLogList);

export const actionsLogSelectors = {
  entireState: actionsLogSelector,
  actionsLog: createSelector(actionsLogSelector, state => state.actionsLog),
};
