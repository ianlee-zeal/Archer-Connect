import { createFeatureSelector, createSelector } from '@ngrx/store';

import { SharedModuleState, FEATURE_NAME } from '../shared.state';

const sharedFeature = createFeatureSelector<SharedModuleState>(FEATURE_NAME);
const documentUploadSelector = createSelector(sharedFeature, state => state.documentUpload);

export const uploadDocumentSelectors = {
  error: createSelector(documentUploadSelector, state => state.error),
  orgsOptions: createSelector(documentUploadSelector, state => state.orgsOptions),
  orgsOptionsLoading: createSelector(documentUploadSelector, state => state.orgsOptionsLoading),
  defaultOrgs:  createSelector(documentUploadSelector, state => state.defaultOrgs),
};
