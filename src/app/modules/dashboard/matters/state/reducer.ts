import { createReducer, Action, combineReducers, on } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { IdValue, Settlement } from '@app/models';
import * as actions from './actions';

export interface MatterState {
  common: MatterCommonState,
}

interface MatterCommonState {
  error: string,
  pending: boolean,
  agGridParams: IServerSideGetRowsParamsExtended,
  relatedSettlementsAgGridParams: IServerSideGetRowsParamsExtended,
  actionBar: ActionHandlersMap;
  matters: IdValue[],
  matter: IdValue,
  relatedSettlements: Settlement[],
}

const personCommonInitialState: MatterCommonState = {
  error: null,
  pending: false,
  agGridParams: null,
  relatedSettlementsAgGridParams: null,
  actionBar: null,
  matters: null,
  matter: null,
  relatedSettlements: null,
};

export const initialState: MatterState = { common: personCommonInitialState };

const matterCommonReducer = createReducer(
  personCommonInitialState,
  on(actions.UpdateActionBar, (state, { actionBar }) => ({ ...state, actionBar })),
  on(actions.GetMattersListRequest, (state, { agGridParams }) => ({ ...state, pending: true, error: null, agGridParams })),
  on(actions.GetMattersListSuccess, (state, { matters }) => ({ ...state, pending: false, matters })),
  on(actions.GetMattersListError, (state, { errorMessage }) => ({ ...state, pending: false, error: errorMessage })),

  on(actions.GetRelatedSettlementsListRequest, (state, { agGridParams }) => ({ ...state, pending: true, error: null, relatedSettlementsAgGridParams: agGridParams })),
  on(actions.GetRelatedSettlementsListSuccess, (state, { relatedSettlements }) => ({ ...state, pending: false, relatedSettlements })),
  on(actions.GetRelatedSettlementsListError, (state, { errorMessage }) => ({ ...state, pending: false, error: errorMessage })),

  on(actions.GetMatter, state => ({ ...state, matter: null })),
  on(actions.GetMatterSuccess, (state, { matter }) => ({ ...state, pending: false, matter })),
  on(actions.MatterError, (state, { error }) => ({ ...state, pending: false, error })),
  on(actions.ClearMatterError, state => ({ ...state, error: null })),
);

function MatterCommonReducer(state: MatterCommonState | undefined, action: Action) {
  return matterCommonReducer(state, action);
}

const matterReducer = combineReducers({ common: MatterCommonReducer }, initialState);

// we have to wrap our reducer like this or it won't compile in prod
export function MatterReducer(state: MatterState | undefined, action: Action) {
  return matterReducer(state, action);
}
