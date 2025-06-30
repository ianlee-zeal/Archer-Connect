import { createSelector, createFeatureSelector } from '@ngrx/store';
import { FEATURE_NAME, SharedModuleState } from '../shared.state';

const sharedFeature = createFeatureSelector<SharedModuleState>(FEATURE_NAME);
const dragDropMultipleSelector = createSelector(sharedFeature, state => state.dragDropMultiple);

export const dragDropMultipleSelectors = {
  entireState: dragDropMultipleSelector,
  allDocumentTypes: createSelector(dragDropMultipleSelector, state => state.allDocumentTypes),
};
