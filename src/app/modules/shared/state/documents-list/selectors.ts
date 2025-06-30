import { createSelector, createFeatureSelector } from '@ngrx/store';
import { SharedModuleState, FEATURE_NAME } from '../shared.state';

const sharedFeature = createFeatureSelector<SharedModuleState>(FEATURE_NAME);
const documentsListSelector = createSelector(sharedFeature, state => state.documentsList);

export const documentsListSelectors = {
  entireState: documentsListSelector,
  documents: createSelector(documentsListSelector, state => state.documents),
  documentTypes: createSelector(documentsListSelector, state => state.documentTypes),
  documentTypesByCategoryId: createSelector(documentsListSelector, state => state.documentTypesByCategoryId),
  productCategories: createSelector(documentsListSelector, state => state.productCategories),
  agGridParams: createSelector(documentsListSelector, state => state.agGridParams),
  entityTypes: createSelector(documentsListSelector, state => state.entityTypes),
};
