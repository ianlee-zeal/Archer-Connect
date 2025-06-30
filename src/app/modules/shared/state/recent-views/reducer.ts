import { createReducer, on, Action } from '@ngrx/store';

import { RecentView } from '@app/models';
import * as actions from './actions';

export interface SharedRecentViewsState {
  error: string,
  recentViews: RecentView[],
}

const initialState: SharedRecentViewsState = {
  error: null,
  recentViews: null,
};

const sharedRecentViewsReducer = createReducer(
  initialState,

  on(actions.GetRecentViews, state => ({ ...state, recentViews: null, error: null })),
  on(actions.GetRecentViewsComplete, (state, { recentViews }) => ({ ...state, recentViews })),

  on(actions.Error, (state, { errorMessage }) => ({ ...state, error: errorMessage })),
);

export function SharedRecentViewsReducer(state: SharedRecentViewsState | undefined, action: Action) {
  return sharedRecentViewsReducer(state, action);
}
