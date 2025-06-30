import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FEATURE_NAME, SharedModuleState } from '../shared.state';

const sharedFeature = createFeatureSelector<SharedModuleState>(FEATURE_NAME);
const clientsListSelector = createSelector(sharedFeature, state => state.clientsList.list);

export const clientsListSelectors = {
  agGridParams: createSelector(clientsListSelector, state => state.agGridParams),
  actionBar: createSelector(clientsListSelector, state => state.actionBar),
  advancedSearch: createSelector(sharedFeature, state => state.clientsList.advancedSearch),
};
