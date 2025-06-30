import { createReducer, combineReducers, on, Action } from '@ngrx/store';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import * as actions from './actions';

import * as fromGrid from '../lien-finalization-grid/state/reducer';
import * as fromFinalizationDetails from '../finalization-details/state/reducer';
export interface LienFinalizationCommonState {
  error: string,
  actionBar: ActionHandlersMap,
}

export const lienFinalizationCommonState: LienFinalizationCommonState = {
  error: null,
  actionBar: null,
};

const lienFinalizationCommonReducer = createReducer(
  lienFinalizationCommonState,

  on(actions.Error, (state, { errorMessage }) => ({ ...state, error: errorMessage })),
  on(actions.UpdateActionBar, (state, { actionBar }) => ({ ...state, actionBar })),
);

export interface LienFinalizationState {
  common: LienFinalizationCommonState,
  lienFinalization: fromGrid.LienFinalizationState,
  finalizationDetails: fromFinalizationDetails.FinalizationDetailsState,
}

const lienFinalizationInitialState: LienFinalizationState = {
  common: lienFinalizationCommonState,
  lienFinalization: fromGrid.lienFinalizationState,
  finalizationDetails: fromFinalizationDetails.finalizationDetailsState,
};

const lienFinalizationReducer = combineReducers({
  common: lienFinalizationCommonReducer,
  lienFinalization: fromGrid.reducer,
  finalizationDetails: fromFinalizationDetails.reducer,

}, lienFinalizationInitialState);

// we have to wrap our reducer like this or it won't compile in prod
export function LienFinalizationReducer(state: LienFinalizationState | undefined, action: Action) {
  return lienFinalizationReducer(state, action);
}
