import { createSelector, createFeatureSelector } from '@ngrx/store';
import * as fromSettlements from './reducer';

const featureSelector = createFeatureSelector<fromSettlements.SettlementState>('settlements_feature');

const common = createSelector(featureSelector, state => state.common);

export const error = createSelector(common, state => state.error);
export const actionBar = createSelector(common, state => state.actionBar);
export const settlements = createSelector(common, state => state.settlements);
export const prevSettlementId = createSelector(common, state => state.prevSettlementId);
export const settlementPreviousUrl = createSelector(common, state => state.settlementPreviousUrl);
export const agGridParams = createSelector(common, state => state.agGridParams);
export const financialSummary = createSelector(common, state => state.financialSummary);

export const advancedSearch = createSelector(featureSelector, state => state.advancedSearch);
