import { LedgerChangeHistory } from '@app/models/ledger-change-history';
import { createReducer, on, Action } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import * as actions from './actions';

export interface StageHistoryState {
  error: any,
  pending: boolean,
  agGridParams: IServerSideGetRowsParamsExtended,
  changeHistory: LedgerChangeHistory[],
}

const initialState: StageHistoryState = {
  error: null,
  pending: false,
  agGridParams: null,
  changeHistory: null,
};

// main reducer function
const stageHistoryReducer = createReducer(
  initialState,
  on(actions.GetStageHistoryList, (state, { agGridParams }) => ({ ...state, pending: true, error: null, changeHistory: null, agGridParams })),
  on(actions.GetStageHistoryListComplete, (state, { changeHistory }) => ({ ...state, pending: false, changeHistory })),
  on(actions.Error, (state, { errorMessage }) => ({ ...state, pending: false, error: errorMessage })),

);

// we have to wrap our reducer like this or it won't compile in prod
export function StageHistoryReducer(state: StageHistoryState | undefined, action: Action) {
  return stageHistoryReducer(state, action);
}
