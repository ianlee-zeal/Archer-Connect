import { createReducer, on, Action } from '@ngrx/store';

import * as notesListActions from './actions';
import { TabInfoState, initialState } from './state';

// main reducer function
const tabInfoReducer = createReducer(
  initialState,
  on(notesListActions.GetTabsCountSuccess, (state, { entityTypeId, tabsCount }) => ({ ...state, error: null, tabsCount: { ...state.tabsCount, [entityTypeId]: tabsCount } })),
);

// we have to wrap our reducer like this or it won't compile in prod
export function TabInfoReducer(state: TabInfoState | undefined, action: Action) {
  return tabInfoReducer(state, action);
}
