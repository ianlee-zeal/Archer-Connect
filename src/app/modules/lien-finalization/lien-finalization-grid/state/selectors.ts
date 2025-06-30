import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LienFinalizationState } from '../../state/reducer';

const feature = createFeatureSelector<LienFinalizationState>('lien_finalization_feature');
const featureSelector = createSelector(feature, state => state.lienFinalization);

export const lienFinalizationList = createSelector(featureSelector, state => state.grid.list);
export const agGridParams = createSelector(featureSelector, state => state.grid.agGridParams);

export const collectorOptions = createSelector(featureSelector, state => state.grid.collectorOptions);
