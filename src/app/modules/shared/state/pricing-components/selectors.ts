import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FEATURE_NAME, SharedModuleState } from '../shared.state';

const sharedFeature = createFeatureSelector<SharedModuleState>(FEATURE_NAME);
const pricingComponentsSelector = createSelector(sharedFeature, state => state.pricingComponents);

export const injuryCategories = createSelector(pricingComponentsSelector, state => state.injuryCategories);

export const pricingComponentsSelectors = {
  injuryCategories: createSelector(pricingComponentsSelector, state => state.injuryCategories),
};