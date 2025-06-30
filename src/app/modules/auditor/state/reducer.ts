import { createReducer, combineReducers, on, Action } from '@ngrx/store';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import * as actions from './actions';

import * as fromAuditBatches from '../audit-batches/state/reducer';

export interface AuditorCommonState {
  error: string,
  actionBar: ActionHandlersMap,
}

export const auditorCommonState: AuditorCommonState = {
  error: null,
  actionBar: null,
};

const auditorCommonReducer = createReducer(
  auditorCommonState,

  on(actions.Error, (state, { errorMessage }) => ({ ...state, error: errorMessage })),
  on(actions.UpdateActionBar, (state, { actionBar }) => ({ ...state, actionBar })),
);

export interface AuditorState {
  common: AuditorCommonState,
  auditBatches: fromAuditBatches.AuditBatchesState,
}

const auditorInitialState: AuditorState = {
  common: auditorCommonState,
  auditBatches: fromAuditBatches.auditBatchesState,
};

const auditorReducer = combineReducers({
  common: auditorCommonReducer,
  auditBatches: fromAuditBatches.reducer,

}, auditorInitialState);

// we have to wrap our reducer like this or it won't compile in prod
export function AuditorReducer(state: AuditorState | undefined, action: Action) {
  return auditorReducer(state, action);
}
