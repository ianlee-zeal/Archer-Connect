import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SharedModuleState, FEATURE_NAME } from '../shared.state';

const sharedFeature = createFeatureSelector<SharedModuleState>(FEATURE_NAME);
const pinnedSelector = createSelector(sharedFeature, state => state.pinnedPages);

export const pinnedPagesSelector = {
  pinnedPages: createSelector(pinnedSelector, state => state.pinnedPages),
};
