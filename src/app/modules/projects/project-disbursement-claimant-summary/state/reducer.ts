/* eslint-disable no-shadow */
import { createReducer, on, Action, combineReducers } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { DisbursementClaimantSummary } from '@app/models/disbursement-claimant-summary';
import * as fromAdvancedSearch from '@app/modules/shared/state/advanced-search/reducer';
import { IdValue } from '@app/models';
import { Dictionary, KeyValuePair } from '@app/models/utils';
import * as claimantsSummaryActions from './actions';

export interface ClaimantsSummaryState {
  common: ClaimantsSummaryCommonState,
  advancedSearch: fromAdvancedSearch.AdvancedSearchState,
}

interface ClaimantsSummaryCommonState {
  gridParams: IServerSideGetRowsParamsExtended,
  claimantSummaryList: DisbursementClaimantSummary[],
  paymentTypes: Dictionary<number, string>,
  paymentTypesForRequest: IdValue[],
}

const claimantsSummaryCommonInitialState: ClaimantsSummaryCommonState = {
  gridParams: null,
  claimantSummaryList: null,
  paymentTypes: null,
  paymentTypesForRequest: null,
};

export const ClaimantsSummaryInitialState: ClaimantsSummaryState = {
  common: claimantsSummaryCommonInitialState,
  advancedSearch: fromAdvancedSearch.initialState,
};

// main reducer function
const claimantsSummaryCommonReducer = createReducer(
  claimantsSummaryCommonInitialState,
  on(claimantsSummaryActions.Error, (state, { error }) => ({ ...state, error })),
  on(claimantsSummaryActions.GetClaimantsSummaryGrid, (state, { agGridParams }) => ({ ...state, gridParams: agGridParams })),
  on(claimantsSummaryActions.GetClaimantsSummaryGridSuccess, (state, { claimantSummaryList }) => ({ ...state, error: null, claimantSummaryList })),
  on(claimantsSummaryActions.GetPaymentTypesSuccess, (state, { paymentTypes }) => ({
    ...state,
    error: null,
    paymentTypes: new Dictionary(paymentTypes.map(type => new KeyValuePair(type.id, type.name))),
  })),
  on(claimantsSummaryActions.GetPaymentTypesForPaymentRequestSuccess, (state, { paymentTypes }) => ({ ...state, error: null, paymentTypesForRequest: paymentTypes })),
);

function ClaimantsSummaryCommonReducer(state: ClaimantsSummaryCommonState | undefined, action: Action) {
  return claimantsSummaryCommonReducer(state, action);
}

export const claimantsSummaryReducer = combineReducers({
  common: ClaimantsSummaryCommonReducer,
  advancedSearch: fromAdvancedSearch.AdvancedSearchReducerFor(claimantsSummaryActions.featureName),
}, ClaimantsSummaryInitialState);

// we have to wrap our reducer like this or it won't compile in prod
export function mainReducer(state: ClaimantsSummaryState | undefined, action: Action) {
  return claimantsSummaryReducer(state, action);
}
