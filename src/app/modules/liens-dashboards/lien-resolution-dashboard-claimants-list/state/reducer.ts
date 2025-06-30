import { createReducer, on, Action, combineReducers } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { ClientService } from '@app/models';
import * as actions from './actions';

export interface LienResolutionDashboardClaimaintsListState {
  error: string,
  agGridParams: IServerSideGetRowsParamsExtended,
  clients: ClientService[],
}

export const LienResolutionDashboardClaimaintsListState: LienResolutionDashboardClaimaintsListState = {
  error: null,
  agGridParams: null,
  clients: null,
};

export interface LienResolutionDashboardClaimantsListCommonState {
  common: LienResolutionDashboardClaimaintsListState,
}

export const initialState: LienResolutionDashboardClaimantsListCommonState = { common: LienResolutionDashboardClaimaintsListState };

const lienResolutionDashboardListReducer = createReducer(
  LienResolutionDashboardClaimaintsListState,
  on(actions.GetClaimantsList, state => ({ ...state, clients: null, error: null })),
  on(actions.GetClaimantsListSuccess, (state, { clients, agGridParams }) => ({ ...state, agGridParams, clients, error: null })),

  on(actions.Error, (state, { errorMessage }) => ({ ...state, error: errorMessage })),
);

const lienResolutionReducer = combineReducers({ common: lienResolutionDashboardListReducer }, initialState);

export function LienResolutionReducer(state: LienResolutionDashboardClaimantsListCommonState | undefined, action: Action) {
  return lienResolutionReducer(state, action);
}
