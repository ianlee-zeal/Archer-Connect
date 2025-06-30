import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CallCenterState } from '../../state/reducer';
import { FEATURE_NAME } from '../../state';

const callCenterFeature = createFeatureSelector<CallCenterState>(FEATURE_NAME);
const communicationFeatureSelector = createSelector(callCenterFeature, state => state.communicationList);

export const communicationListSelectors = {
  actionBar: createSelector(communicationFeatureSelector, state => state.actionBar),
  searchParams: createSelector(communicationFeatureSelector, state => state.agGridParams),
  entity: createSelector(communicationFeatureSelector, state => state.entityId),
  entityType: createSelector(communicationFeatureSelector, state => state.entityType),
};
