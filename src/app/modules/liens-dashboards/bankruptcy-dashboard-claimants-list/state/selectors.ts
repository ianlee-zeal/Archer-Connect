import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LienState } from '../../state/reducer';
import { FEATURE_NAME } from '../../state';

const lienFeature = createFeatureSelector<LienState>(FEATURE_NAME);
const lienFeatureSelector = createSelector(lienFeature, state => state.bankruptcyDashboardClaimaintsList);

export const searchParams = createSelector(lienFeatureSelector, state => state.common.agGridParams);
export const clients = createSelector(lienFeatureSelector, state => state.common.clients);
export const error = createSelector(lienFeatureSelector, state => state.common.error);
