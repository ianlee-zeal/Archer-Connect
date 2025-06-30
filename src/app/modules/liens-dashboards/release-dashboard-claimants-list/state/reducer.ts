import { createReducer, on, Action, combineReducers } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { ClientService } from '@app/models';
import * as actions from './actions';

export interface ReleaseDashboardClaimaintsListState {
  error: string,
  agGridParams: IServerSideGetRowsParamsExtended,
  clients: ClientService[],
}

export const ReleaseDashboardClaimaintsListState: ReleaseDashboardClaimaintsListState = {
  error: null,
  agGridParams: null,
  clients: null,
};

export interface ReleaseDashboardClaimantsListCommonState {
  common: ReleaseDashboardClaimaintsListState;
}

export const initialState: ReleaseDashboardClaimantsListCommonState = { common: ReleaseDashboardClaimaintsListState };

const releaseDashboardListReducer = createReducer(
  ReleaseDashboardClaimaintsListState,
  on(actions.GetClaimantsList, state => ({ ...state, clients: null, error: null })),
  on(actions.GetClaimantsListSuccess, (state, { clients, agGridParams }) => ({ ...state, agGridParams, clients, error: null })),

  on(actions.Error, (state, { errorMessage }) => ({ ...state, error: errorMessage })),
);

const releaseReducer = combineReducers({ common: releaseDashboardListReducer }, initialState);

export function ReleaseReducer(state: ReleaseDashboardClaimantsListCommonState | undefined, action: Action) {
  return releaseReducer(state, action);
}
