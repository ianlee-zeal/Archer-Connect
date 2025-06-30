import { createReducer, on, Action, combineReducers } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { ClientService } from '@app/models';
import * as actions from './actions';

export interface IQsfAdminDashboardClaimaintsListState {
  error: string,
  agGridParams: IServerSideGetRowsParamsExtended,
  clients: ClientService[],
}

export const QsfAdminDashboardClaimaintsListState: IQsfAdminDashboardClaimaintsListState = {
  error: null,
  agGridParams: null,
  clients: null,
};

export interface QsfAdminDashboardClaimantsListCommonState {
  common: IQsfAdminDashboardClaimaintsListState,
}

export const initialState: QsfAdminDashboardClaimantsListCommonState = { common: QsfAdminDashboardClaimaintsListState };

const qsfAdminDashboardListReducer = createReducer(
  QsfAdminDashboardClaimaintsListState,
  on(actions.GetClaimantsList, state => ({ ...state, clients: null, error: null })),
  on(actions.GetClaimantsListSuccess, (state, { clients, agGridParams }) => ({ ...state, agGridParams, clients, error: null })),

  on(actions.Error, (state, { errorMessage }) => ({ ...state, errorMessage })),
);

const qsfAdminReducer = combineReducers({ common: qsfAdminDashboardListReducer }, initialState);

export function QsfAdminReducer(state: QsfAdminDashboardClaimantsListCommonState | undefined, action: Action) {
  return qsfAdminReducer(state, action);
}
