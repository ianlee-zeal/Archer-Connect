import { createReducer, on, Action } from '@ngrx/store';

import * as actions from './actions';
import { initialState, SharedSettlementInfoState } from './state';

// main reducer function
const sharedSettlementInfoReducer = createReducer(
  initialState,

  on(actions.SettlementInfoError, (state, { error }) => ({ ...state, pending: false, error })),
  on(actions.GetSettlementInfo, state => ({ ...state, pending: true, error: null, settlement: null, settlementInfoHeader: null, isSettlementValid: false })),
  on(actions.GetSettlementInfoComplete, (state, { settlement }) => ({ ...state, pending: false, settlement, settlementInfoHeader: settlement, showFinancialSummary: settlement?.showFinancialSummary })),

  on(actions.SaveUpdatedSettlement, state => ({ ...state, error: null, pending: true })),
  on(actions.SaveUpdatedSettlementComplete, (state, { updatedSettlement }) => ({
    ...state,
    pending: false,
    settlement: updatedSettlement,
    settlementInfoHeader: updatedSettlement,
    showFinancialSummary: updatedSettlement?.showFinancialSummary,
  })),

  on(actions.DeleteSettlement, state => ({ ...state, pending: true })),
  on(actions.DeleteSettlementComplete, state => ({ ...state, pending: false })),

  on(actions.UpdateSettlementInfo, (state, { settlement, isSettlementValid }) => ({ ...state, settlement, isSettlementValid })),

  on(actions.UpdateSettlementInfoActionBar, (state, { actionBar }) => ({ ...state, actionBar })),

);

// we have to wrap our reducer like this or it won't compile in prod
export function SharedSettlementInfoReducer(state: SharedSettlementInfoState | undefined, action: Action) {
  return sharedSettlementInfoReducer(state, action);
}
