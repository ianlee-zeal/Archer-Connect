import { createReducer, on, Action } from '@ngrx/store';

import { PinnedPage } from '@app/models';
import * as actions from './actions';

export interface SharedPinnedPagesState {
  error: string,
  pinnedPages: PinnedPage[],
}

const initialState: SharedPinnedPagesState = {
  error: null,
  pinnedPages: null,
};

const sharedPinnedPagesReducer = createReducer(
  initialState,

  on(actions.GetPinnedPages, state => ({ ...state, pinnedPages: null, error: null })),
  on(actions.GetPinnedPagesComplete, (state, { pinnedPages }) => ({ ...state, pinnedPages })),

  on(actions.Error, (state, { errorMessage }) => ({ ...state, error: errorMessage })),
);

export function SharedPinnedPagesReducer(state: SharedPinnedPagesState | undefined, action: Action) {
  return sharedPinnedPagesReducer(state, action);
}
