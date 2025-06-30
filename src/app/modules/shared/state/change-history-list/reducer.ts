import { createReducer, on, Action } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { ChangeHistory } from '../../../../models/change-history';
import * as actions from './actions';

export interface ElectionFormChangeHistoryListState {
  error: any,
  pending: boolean,
  agGridParams: IServerSideGetRowsParamsExtended,
  changeHistory: ChangeHistory[],
}

const initialState: ElectionFormChangeHistoryListState = {
  error: null,
  pending: false,
  agGridParams: null,
  changeHistory: null,
};

// main reducer function
const changeHistoryListReducer = createReducer(
  initialState,
  on(actions.GetChangeHistoryList, (state, { agGridParams }) => ({ ...state, pending: true, error: null, changeHistory: null, agGridParams })),
  on(actions.GetChangeHistoryListComplete, (state, { changeHistory }) => ({ ...state, pending: false, changeHistory })),
  on(actions.Error, (state, { errorMessage }) => ({ ...state, pending: false, error: errorMessage })),

);

// we have to wrap our reducer like this or it won't compile in prod
export function ChangeHistoryListReducer(state: ElectionFormChangeHistoryListState | undefined, action: Action) {
  return changeHistoryListReducer(state, action);
}
