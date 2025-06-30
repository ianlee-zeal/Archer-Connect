import { createReducer, on, Action, combineReducers } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { ClientService } from '@app/models';
import * as actions from './actions';

export interface BankruptcyDashboardClaimaintsListState {
  error: string,
  agGridParams: IServerSideGetRowsParamsExtended,
  clients: ClientService[],
}

export const BankruptcyDashboardClaimaintsListState: BankruptcyDashboardClaimaintsListState = {
  error: null,
  agGridParams: null,
  clients: null,
};

export interface BankruptcyDashboardClaimantsListCommonState {
  common: BankruptcyDashboardClaimaintsListState,
}

export const initialState: BankruptcyDashboardClaimantsListCommonState = { common: BankruptcyDashboardClaimaintsListState };

const bankruptcyDashboardListReducer = createReducer(
  BankruptcyDashboardClaimaintsListState,
  on(actions.GetClaimantsList, state => ({ ...state, clients: null, error: null })),
  on(actions.GetClaimantsListSuccess, (state, { clients, agGridParams }) => ({ ...state, agGridParams, clients, error: null })),

  on(actions.Error, (state, { errorMessage }) => ({ ...state, errorMessage })),
);

const bankruptcyReducer = combineReducers({ common: bankruptcyDashboardListReducer }, initialState);

export function BankruptcyReducer(state: BankruptcyDashboardClaimantsListCommonState | undefined, action: Action) {
  return bankruptcyReducer(state, action);
}
