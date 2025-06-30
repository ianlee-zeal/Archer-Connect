import { createFeatureSelector, createSelector } from '@ngrx/store';

import { SharedModuleState, FEATURE_NAME } from '../shared.state';

const sharedFeature = createFeatureSelector<SharedModuleState>(FEATURE_NAME);
const outcomeBasedPricingState = createSelector(sharedFeature, state => state.outcomeBasedPricing);

export const outcomeBasedPricingSelectors = {
  triggerTypes: createSelector(outcomeBasedPricingState, state => state.triggerTypes),
  variablePricingTypes: createSelector(outcomeBasedPricingState, state => state.variablePricingTypes),
  scenarios: createSelector(outcomeBasedPricingState, state => state.scenarios),
  injuryCategories: createSelector(outcomeBasedPricingState, state => state.injuryCategories),
  outcomeBasedPricings: createSelector(outcomeBasedPricingState, state => state.outcomeBasedPricings),
};
