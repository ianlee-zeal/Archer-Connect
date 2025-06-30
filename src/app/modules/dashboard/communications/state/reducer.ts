import { createReducer, Action, combineReducers, on } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { CommunicationRecord } from '@app/models/communication-center/communication-record';
import * as actions from './actions';

export interface GlobalCommunicationSearchState {
  common: GlobalCommunicationSearchCommonState,
}

interface GlobalCommunicationSearchCommonState {
  error: string,
  pending: boolean,
  agGridParams: IServerSideGetRowsParamsExtended,
  actionBar: ActionHandlersMap;
  communications: CommunicationRecord[],
}

const globalCommunicationSearchCommonState: GlobalCommunicationSearchCommonState = {
  error: null,
  pending: false,
  agGridParams: null,
  actionBar: null,
  communications: null,
};

export const initialState: GlobalCommunicationSearchState = { common: globalCommunicationSearchCommonState };

const globalCommunicationSearchCommonReducer = createReducer(
  globalCommunicationSearchCommonState,
  on(actions.UpdateActionBar, (state, { actionBar }) => ({ ...state, actionBar })),
  on(actions.GetGlobalCommunicationSearchListRequest, (state, { agGridParams }) => ({ ...state, pending: true, error: null, agGridParams })),
  on(actions.GetGlobalCommunicationSearchListSuccess, (state, { communications }) => ({ ...state, pending: false, communications })),
  on(actions.GetGlobalCommunicationSearchListError, (state, { errorMessage }) => ({ ...state, pending: false, error: errorMessage })),
);

function GlobalCommunicationSearchCommonReducer(state: GlobalCommunicationSearchCommonState | undefined, action: Action) {
  return globalCommunicationSearchCommonReducer(state, action);
}

const globalCommunicationSearchReducer = combineReducers({ common: GlobalCommunicationSearchCommonReducer }, initialState);

// we have to wrap our reducer like this or it won't compile in prod
export function GlobalCommunicationSearchReducer(state: GlobalCommunicationSearchState | undefined, action: Action) {
  return globalCommunicationSearchReducer(state, action);
}
