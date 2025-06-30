import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LienFinalizationState } from '../../../state/reducer';

const feature = createFeatureSelector<LienFinalizationState>('lien_finalization_feature');
export const lienProcessingModalState = createSelector(feature, state => state.lienFinalization.modal);

export const lienProcessingModalSelectors = {
  error: createSelector(lienProcessingModalState, state => state.error),
  lienFinalizationRun: createSelector(lienProcessingModalState, state => state.lienFinalizationRun),
  status: createSelector(lienProcessingModalState, state => state.status),
  dropdownValues: createSelector(lienProcessingModalState, state => state.dropdownValues),
  isClosingDisabled: createSelector(lienProcessingModalState, state => state.isClosingDisabled),
};
