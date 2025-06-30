import { createReducer, combineReducers, on, Action } from '@ngrx/store';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import * as actions from './actions';

import * as fromGrid from '../lien-deficiencies-grid/state/reducer';
import * as fromManagementGrid from '../lien-deficiencies-management-grid/state/reducer';

export interface LienDeficienciesCommonState {
  error: string,
  actionBar: ActionHandlersMap,
}

export const lienDeficienciesCommonState: LienDeficienciesCommonState = {
  error: null,
  actionBar: null,
};

const lienDeficienciesCommonReducer = createReducer(
  lienDeficienciesCommonState,

  on(actions.Error, (state, { error }) => ({ ...state, error })),
  on(actions.UpdateActionBar, (state, { actionBar }) => ({ ...state, actionBar })),
);

export interface LienDeficienciesState {
  common: LienDeficienciesCommonState,
  lienDeficiencies: fromGrid.LienDeficienciesState,
  lienDeficienciesManagement: fromManagementGrid.LienDeficienciesManagementState,
}

const lienDeficienciesInitialState: LienDeficienciesState = {
  common: lienDeficienciesCommonState,
  lienDeficiencies: fromGrid.lienDeficienciesState,
  lienDeficienciesManagement: fromManagementGrid.lienDeficienciesManagementState,
};

const lienDeficienciesReducer = combineReducers({
  common: lienDeficienciesCommonReducer,
  lienDeficiencies: fromGrid.reducer,
  lienDeficienciesManagement: fromManagementGrid.reducer,

}, lienDeficienciesInitialState);

// we have to wrap our reducer like this or it won't compile in prod
export function LienDeficienciesReducer(state: LienDeficienciesState | undefined, action: Action) {
  return lienDeficienciesReducer(state, action);
}
