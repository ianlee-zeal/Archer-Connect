import { createSelector, createFeatureSelector } from '@ngrx/store';

import { FEATURE_NAME, SharedModuleState } from '../shared.state';

const sharedFeature = createFeatureSelector<SharedModuleState>(FEATURE_NAME);
const documentDetailsSelector = createSelector(sharedFeature, state => state.documentDetails);

export const documentDetailsSelectors = {
  document: createSelector(documentDetailsSelector, state => state.document),
  documentDetailsHeader: createSelector(documentDetailsSelector, state => state.documentDetailsHeader),
  file: createSelector(documentDetailsSelector, state => state.file),
  isDocumentValid: createSelector(documentDetailsSelector, state => state.isDocumentValid),
  pending: createSelector(documentDetailsSelector, state => state.pending),
  error: createSelector(documentDetailsSelector, state => state.error),
  actionBar: createSelector(documentDetailsSelector, state => state.actionBar),
  onCancelAction: createSelector(documentDetailsSelector, state => state.onCancelAction),
};
