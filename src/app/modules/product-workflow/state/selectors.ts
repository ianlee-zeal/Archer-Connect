import { createFeatureSelector, createSelector } from '@ngrx/store';

import { ProductWorkflowState, FEATURE_NAME } from './reducers';

const sharedFeature = createFeatureSelector<ProductWorkflowState>(FEATURE_NAME);
const productWorkflowFeatureState = createSelector(sharedFeature, state => state);

export const productWorkflowSelectors = {
    error: createSelector(productWorkflowFeatureState, state => state.error),
    dropdownValues: createSelector(productWorkflowFeatureState, state => state.dropdownValues),
    phases: createSelector(productWorkflowFeatureState, state => state.dropdownValues.phases),
    stages: createSelector(productWorkflowFeatureState, state => state.dropdownValues.stages),
    subProductCategories: createSelector(productWorkflowFeatureState, state => state.dropdownValues.subProductCategories),
    productCategories: createSelector(productWorkflowFeatureState, state => state.dropdownValues.productCategories),
    products: createSelector(productWorkflowFeatureState, state => state.dropdownValues.products),
};
