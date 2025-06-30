import { createReducer, on, Action } from '@ngrx/store';

import * as dashboardActions from './actions'

export interface DashboardState {
  index: any,
  error: any,
  pending: boolean
}

const initialState: DashboardState = {
  index: null,
  error: null,
  pending: false
};

// main reducer function
const DashboardReducer = createReducer(
  initialState,
  on(dashboardActions.Error, (state, { error }) => ({ ...state, error })),
)

// we have to wrap our reducer like this or it won't compile in prod
export function reducer(state: DashboardState | undefined, action: Action) {
  return DashboardReducer(state, action);
}
