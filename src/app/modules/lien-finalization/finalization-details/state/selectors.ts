import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LienFinalizationState } from '@app/modules/lien-finalization/state/reducer';

const finalizationDetailsFeature = createFeatureSelector<LienFinalizationState>('lien_finalization_feature');
const commonFeatureSelector = createSelector(finalizationDetailsFeature, state => state.finalizationDetails.common);
const finalizationDetailsGridFeatureSelector = createSelector(finalizationDetailsFeature, state => state.finalizationDetails.finalizationDetailsGrid);

export const finalizationDetailsHeader = createSelector(commonFeatureSelector, state => state.finalizationDetailsHeader);
export const list = createSelector(finalizationDetailsGridFeatureSelector, state => state.list);
export const agGridParams = createSelector(finalizationDetailsGridFeatureSelector, state => state.agGridParams);
