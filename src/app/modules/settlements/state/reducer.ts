import { createReducer, on, Action, combineReducers } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { Settlement } from '@app/models';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import * as fromAdvancedSearch from '@app/modules/shared/state/advanced-search/reducer';
import * as actions from './actions';
import { SettlementFinancialSummary } from '@app/models/settlement/settlement-financial-summary';

export interface SettlementState {
  common: SettlementCommonState,
  advancedSearch: fromAdvancedSearch.AdvancedSearchState,
}

interface SettlementCommonState {
  error: string,
  pending: boolean,
  agGridParams: IServerSideGetRowsParamsExtended,
  settlements: Settlement[],
  prevSettlementId: number;
  settlementPreviousUrl: string;
  actionBar: ActionHandlersMap;
  financialSummary: SettlementFinancialSummary;
}

const settlementCommonInitialState: SettlementCommonState = {
  error: null,
  pending: false,
  agGridParams: null,
  settlements: null,
  prevSettlementId: null,
  settlementPreviousUrl: null,
  actionBar: null,
  financialSummary: null,
};

export const initialState: SettlementState = {
  common: settlementCommonInitialState,
  advancedSearch: fromAdvancedSearch.initialState,
};

const settlementsCommonReducer = createReducer(
  settlementCommonInitialState,
  on(actions.Error, (state, { errorMessage }) => ({ ...state, errorMessage })),

  on(actions.GetSettlementsList, state => ({ ...state, pending: true, error: null, settlements: null })),
  on(actions.GetSettlementsListComplete, (state, { settlements, agGridParams }) => ({ ...state, pending: false, settlements, agGridParams })),
  on(actions.GetSettlementsListError, (state, { errorMessage }) => ({ ...state, pending: false, error: errorMessage })),

  on(actions.CreateSettlement, (state, { settlement, modal }) => ({ ...state, error: null, settlement, modal })),
  on(actions.CreateSettlementComplete, (state, modal) => ({ ...state, settlement: null, error: null, modal })),

  on(actions.ResetCreateSettlementState, state => ({ ...state, error: null })),
  on(actions.UpdateActionBar, (state, { actionBar }) => ({ ...state, actionBar: { ...actionBar } })),

  on(actions.UpdatePreviousSettlementId, (state, { prevSettlementId }) => ({ ...state, prevSettlementId })),
  on(actions.UpdatePreviousSettlementUrl, (state, { settlementPreviousUrl }) => ({ ...state, settlementPreviousUrl })),

  on(actions.DownloadDocumentError, (state, { errorMessage }) => ({ ...state, error: errorMessage })),

  on(actions.GetFinancialSummary, state => ({ ...state, pending: true, error: null, financialSummary: null })),
  on(actions.GetFinancialSummarySuccess, (state, { financialSummary }) => ({ ...state, pending: false, financialSummary })),
  on(actions.GetFinancialSummaryError, (state, { errorMessage }) => ({ ...state, pending: false, error: errorMessage })),

);

function SettlementsCommonReducer(state: SettlementCommonState | undefined, action: Action) {
  return settlementsCommonReducer(state, action);
}

const settlementsReducer = combineReducers({
  common: SettlementsCommonReducer,
  advancedSearch: fromAdvancedSearch.AdvancedSearchReducerFor(actions.FEATURE_NAME),
}, initialState);

// we have to wrap our reducer like this or it won't compile in prod
export function SettlementReducer(state: SettlementState | undefined, action: Action) {
  return settlementsReducer(state, action);
}
