/* eslint-disable no-shadow */
import { createReducer, on, Action, combineReducers } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import * as fromAdvancedSearch from '@app/modules/shared/state/advanced-search/reducer';
import { ClaimantSummaryRollup } from '@app/models/claimant-summary-rollup';
import * as claimantsSummaryActions from './actions';

export interface ClaimantsSummaryRollupState {
  common: ClaimantsSummaryRollupCommonState,
  advancedSearch: fromAdvancedSearch.AdvancedSearchState,
}

interface ClaimantsSummaryRollupCommonState {
  gridParams: IServerSideGetRowsParamsExtended,
  claimantSummaryRollupList: ClaimantSummaryRollup[],
}

const claimantsSummaryRollupCommonInitialState: ClaimantsSummaryRollupCommonState = {
  gridParams: null,
  claimantSummaryRollupList: null,
};

export const ClaimantsSummaryRollupInitialState: ClaimantsSummaryRollupState = {
  common: claimantsSummaryRollupCommonInitialState,
  advancedSearch: fromAdvancedSearch.initialState,
};

// main reducer function
const claimantsSummaryRollupCommonReducer = createReducer(
  claimantsSummaryRollupCommonInitialState,
  on(claimantsSummaryActions.Error, (state, { error }) => ({ ...state, error })),
  on(claimantsSummaryActions.GetClaimantsSummaryRollupGrid, (state, { agGridParams }) => ({ ...state, gridParams: agGridParams })),
  on(claimantsSummaryActions.GetClaimantsSummaryRollupGridSuccess, (state, { claimantSummaryRollupList }) => ({ ...state, error: null, claimantSummaryRollupList })),
);

function ClaimantsSummaryRollupCommonReducer(state: ClaimantsSummaryRollupCommonState | undefined, action: Action) {
  return claimantsSummaryRollupCommonReducer(state, action);
}

export const claimantsSummaryRollupReducer = combineReducers({
  common: ClaimantsSummaryRollupCommonReducer,
  advancedSearch: fromAdvancedSearch.AdvancedSearchReducerFor(claimantsSummaryActions.featureName),
}, ClaimantsSummaryRollupInitialState);

// we have to wrap our reducer like this or it won't compile in prod
export function mainReducer(state: ClaimantsSummaryRollupState | undefined, action: Action) {
  return claimantsSummaryRollupReducer(state, action);
}
