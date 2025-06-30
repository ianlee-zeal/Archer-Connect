import { createSelector, createFeatureSelector } from '@ngrx/store';
import { LienDeficienciesState } from './reducer';

const featureSelector = createFeatureSelector<LienDeficienciesState>('lien_deficiencies_feature');
const commonStateSelector = createSelector(featureSelector, state => state.common);

export const actionBar = createSelector(commonStateSelector, state => state.actionBar);
export const error = createSelector(commonStateSelector, state => state.error);

export const lienFinalizationSelector = {
  common: commonStateSelector,
  lienFinalization: createSelector(featureSelector, state => state.lienDeficiencies),
};
