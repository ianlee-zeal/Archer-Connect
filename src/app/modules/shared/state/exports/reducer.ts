import { createReducer, on, Action } from '@ngrx/store';
import * as actions from './actions';
import { ActionHandlersMap } from '../../action-bar/action-handlers-map';

export interface SharedExportsState {
  isExporting: boolean,
  isActionInProgress: boolean,
  actionBar: ActionHandlersMap,
}

const initialState: SharedExportsState = {
  isExporting: false,
  isActionInProgress: false,
  actionBar: null,
};

// main reducer function
const sharedExportsReducer = createReducer(
  initialState,

  on(actions.SetExportStatus, (state, { isExporting }) => ({ ...state, isExporting })),
  on(actions.SetActionStatus, (state, { isActionInProgress }) => ({ ...state, isActionInProgress })),
  on(actions.UpdateActionBar, (state, { actionBar }) => ({ ...state, actionBar })),
);

// we have to wrap our reducer like this or it won't compile in prod
export function SharedExportsReducer(state: SharedExportsState | undefined, action: Action) {
  return sharedExportsReducer(state, action);
}
