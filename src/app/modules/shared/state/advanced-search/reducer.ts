import { createReducer, on, Action } from '@ngrx/store';
import { SearchState } from '@app/models/advanced-search/search-state';
import * as advancedSearchActions from './actions';

export interface AdvancedSearchState {
  searchParams: SearchState[],
  isVisible: boolean,
  showExpandBtn: boolean;
}

export const initialState: AdvancedSearchState = {
  searchParams: [],
  isVisible: false,
  showExpandBtn: false,
};

function advancedSearchReducer(featureName: string) {
  return createReducer(
    initialState,
    on(advancedSearchActions.SaveSearchParamsFor(featureName), (state, { items }) => ({
      ...state,
      searchParams: [
        ...items,
      ],
    })),
    on(advancedSearchActions.SaveAdvancedSearchVisibilityFor(featureName), (state, { isVisible }) => ({
      ...state,
      isVisible,
    })),
    on(advancedSearchActions.SetShowExpandButtonForFilters(featureName), (state, { showExpandBtn }) => ({
      ...state,
      showExpandBtn,
    })),
  );
}

export function AdvancedSearchReducerFor(featureName: string) {
  return (state: AdvancedSearchState | undefined, action: Action) => advancedSearchReducer(featureName)(state, action);
}
