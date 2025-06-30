import { createReducer, on, Action } from '@ngrx/store';
import { ActionLogRecord } from '@app/models/actionLogRecord';
import * as logInHistoryActions from './actions';
import { IServerSideGetRowsRequestExtended } from '../../_interfaces/ag-grid/ss-get-rows-request';

export interface SharedActionsLogListState {
  error: any,
  actionsLog: ActionLogRecord[],
  agGridParams: IServerSideGetRowsRequestExtended;
}

const initialState: SharedActionsLogListState = {
  error: null,
  actionsLog: null,
  agGridParams: null,
};


// main reducer function
const sharedActionsLogListReducer = createReducer(
  initialState,

  on(logInHistoryActions.GetActionsLogRequest, state => ({ ...state, error: null })),
  on(logInHistoryActions.GetActionsLogRequestComplete, (state, { actionsLog, agGridParams }) => ({ ...state, actionsLog, agGridParams: agGridParams.request })),

);


// we have to wrap our reducer like this or it won't compile in prod
export function SharedActionsLogListReducer(state: SharedActionsLogListState | undefined, action: Action) {
  return sharedActionsLogListReducer(state, action);
}
