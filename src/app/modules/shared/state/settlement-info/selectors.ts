import { createSelector, createFeatureSelector } from '@ngrx/store';

import { FEATURE_NAME, SharedModuleState } from '../shared.state';

const sharedFeature = createFeatureSelector<SharedModuleState>(FEATURE_NAME);
const settlementInfoSelector = createSelector(sharedFeature, state => state.settlementInfo);

export const settlementInfoSelectors = {
  settlement: createSelector(settlementInfoSelector, state => state.settlement),
  settlementInfoHeader: createSelector(settlementInfoSelector, state => state.settlementInfoHeader),
  showFinancialSummary: createSelector(settlementInfoSelector, state => state.showFinancialSummary),
  isSettlementValid: createSelector(settlementInfoSelector, state => state.isSettlementValid),
  prevSettlementId: createSelector(settlementInfoSelector, state => state.prevSettlementId),
  actionBar: createSelector(settlementInfoSelector, state => state.actionBar),
  error: createSelector(settlementInfoSelector, state => state.error),
};
