import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { createReducer, on, Action, combineReducers } from '@ngrx/store';

import * as actions from './actions';

export interface AccountingCommonState {
  error: string,
  actionBar: ActionHandlersMap,
}

const initialAccountingCommonState: AccountingCommonState = {
  error: null,
  actionBar: null,
};

const accountingCommonReducer = createReducer(
  initialAccountingCommonState,
  on(actions.UpdateActionBar, (state, { actionBar }) => ({ ...state, actionBar })),
  on(actions.Error, (state, { error }) => ({ ...state, error })),
);

export interface AccountingState {
  common: AccountingCommonState,
}

const initialState: AccountingState = { common: initialAccountingCommonState };

const accountingReducer = combineReducers({ common: accountingCommonReducer }, initialState);

export function AccountingReducer(state: AccountingState | undefined, action: Action) {
  return accountingReducer(state, action);
}
