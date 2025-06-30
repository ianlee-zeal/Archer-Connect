import { createFeatureSelector, createSelector } from '@ngrx/store';

import { SharedModuleState, FEATURE_NAME } from '../shared.state';

const sharedFeature = createFeatureSelector<SharedModuleState>(FEATURE_NAME);
const selector = createSelector(sharedFeature, state => state.documentGeneration);

export const documentGenerationSelectors = {
  root: selector,
};
