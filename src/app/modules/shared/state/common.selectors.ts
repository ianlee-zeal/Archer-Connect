import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FEATURE_NAME, SharedModuleState } from './shared.state';

const sharedFeature = createFeatureSelector<SharedModuleState>(FEATURE_NAME);
const commonSelector = createSelector(sharedFeature, state => state.common);

export const commonSelectors = {
  formsIndex: createSelector(commonSelector, state => state.formsIndex),
  currentTask: createSelector(commonSelector, state => state.currentTask),
  pending: createSelector(commonSelector, state => state.pending),
  error: createSelector(commonSelector, state => state.error),
  selectedOrganization: createSelector(commonSelector, state => state.selectedOrganization),
  mimeTypes: createSelector(commonSelector, state => state.mimeTypes),
  allowedFileExtensions: createSelector(commonSelector, state => state.allowedFileExtensions),
  pager: createSelector(commonSelector, state => state.pager),
};
