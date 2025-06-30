import { ClientService } from '@app/models';
import { createReducer, on, Action, combineReducers } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import * as actions from './actions';

export interface ProbateDashboardClaimaintsListState {
  error: string,
  agGridParams: IServerSideGetRowsParamsExtended | null,
  clients: ClientService[],
}

export const ProbateDashboardClaimaintsListState: ProbateDashboardClaimaintsListState = {
  error: null,
  agGridParams: null,
  clients: null,
};

export interface ProbateDashboardClaimantsListCommonState {
  common: ProbateDashboardClaimaintsListState;
}

export const initialState: ProbateDashboardClaimantsListCommonState = { common: ProbateDashboardClaimaintsListState };

const probateDashboardListReducer = createReducer(
  ProbateDashboardClaimaintsListState,
  on(actions.GetClaimantsList, state => ({ ...state, clients: null, error: null })),
  on(actions.GetClaimantsListSuccess, (state, { clients, agGridParams }) => ({ ...state, agGridParams, clients, error: null })),

  on(actions.Error, (state, { errorMessage }) => ({ ...state, errorMessage })),
);

const probateReducer = combineReducers({ common: probateDashboardListReducer }, initialState);

export function ProbateReducer(state: ProbateDashboardClaimantsListCommonState | undefined, action: Action) {
  return probateReducer(state, action);
}
