/* eslint-disable @typescript-eslint/no-use-before-define */
import { createReducer, on, Action } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { SearchState } from '@app/models/advanced-search/search-state';
import { Dictionary, IDictionary } from '@app/models/utils';
import { EntityTypeEnum } from '@app/models/enums';
import * as savedSearchListActions from './actions';
import { SavedSearch } from '../../../../models/saved-search';
import { SelectOption } from '../../_abstractions/base-select';

export interface SharedSavedSearchState {
  error: any;
  savedSearchList: SavedSearch[];
  removedSearches: SearchState[];
  savedSearchListByEntityType: SavedSearch[];
  currentSearchByEntityType: IDictionary<EntityTypeEnum, SavedSearch>;
  savedSearchesGrid: SavedSearch[];
  agGridParams:IServerSideGetRowsParamsExtended;
  orgUsersOptions: SelectOption[];
  isCurrentSearchEdited: boolean;
  showSavedSearchListByEntityType: boolean;
}

const initialState: SharedSavedSearchState = {
  error: null,
  removedSearches: [],
  savedSearchListByEntityType: null,
  savedSearchList: null,
  orgUsersOptions: null,
  savedSearchesGrid: null,
  agGridParams: null,
  currentSearchByEntityType: new Dictionary<EntityTypeEnum, SavedSearch>(),
  isCurrentSearchEdited: null,
  showSavedSearchListByEntityType: false,
};

// main reducer function
const sharedSavedSearchReducer = createReducer(
  initialState,

  on(savedSearchListActions.GetSavedSearchList, state => ({ ...state, error: null })),
  on(savedSearchListActions.GetSavedSearchListComplete, (state, { savedSearchList }) => ({ ...state, savedSearchList })),

  on(savedSearchListActions.GetSavedSearchesGrid, state => ({ ...state, error: null })),
  on(savedSearchListActions.GetSavedSearchesGridComplete, (state, { savedSearchesGrid, agGridParams }) => ({ ...state, savedSearchesGrid, agGridParams })),

  on(savedSearchListActions.GetUsersOptionsComplete, (state, { users }) => ({ ...state, orgUsersOptions: users })),
  on(savedSearchListActions.GetSavedSearchListByEntityType, state => ({ ...state, error: null })),
  on(savedSearchListActions.GetSavedSearchListByEntityTypeComplete, (state, { savedSearchList }) => ({
    ...state,
    savedSearchListByEntityType: savedSearchList,
  })),

  on(savedSearchListActions.ShowSavedSearchListByEntityType, (state, { value }) => ({
    ...state,
    showSavedSearchListByEntityType: value,
  })),

  on(savedSearchListActions.GetSavedSearchComplete, (state, { entityType, savedSearch }) => ({
    ...state,
    currentSearchByEntityType: getNewCurrentSearchByEntityType(state, entityType, savedSearch),
  })),

  on(savedSearchListActions.ResetCurrentSearch, (state, { entityType }) => ({ ...state, currentSearchByEntityType: resetCurrentSearchByEntityType(state, entityType) })),
  on(savedSearchListActions.SwitchEditState, (state, { isEdited }) => ({ ...state, isCurrentSearchEdited: isEdited })),

  on(savedSearchListActions.SaveRemovedSearches, (state, { removedSearches }) => ({ ...state, removedSearches })),
  on(savedSearchListActions.ResetRemovedSearches, (state, { entityType }) => resetRemovedSearchesReducer(state, entityType)),
);

// we have to wrap our reducer like this or it won't compile in prod
export function SharedSavedSearchReducer(state: SharedSavedSearchState | undefined, action: Action) {
  return sharedSavedSearchReducer(state, action);
}

// AC-5880
// Reducer does the following:
// 1. If removed searches array is empty, but search is saved into the store - set the flag indicating that restoring should be skipped
// 2. If removed searches array is not empty - restore search model fields (since they are set to undefined on removal) and set the flag
// skipRestoring flag must be checked in places where we should not restore saved search (i.e. when navigating from the project claimants list to main claimants list)
function resetRemovedSearchesReducer(state: SharedSavedSearchState, entityType: EntityTypeEnum): SharedSavedSearchState {
  const newState = { ...state };
  if ((!newState.removedSearches || !newState.removedSearches.length) && newState.currentSearchByEntityType.getValue(entityType)) {
    const savedSearch = newState.currentSearchByEntityType.getValue(entityType);
    savedSearch.skipRestoring = true;
    newState.currentSearchByEntityType = getNewCurrentSearchByEntityType(newState, entityType, savedSearch);
    return newState;
  }
  let index = 0;
  const currentSearch = newState.currentSearchByEntityType.getValue(entityType);
  if (currentSearch && currentSearch.searchModel) {
    // Restore field properties at search models when removed searches are cleared
    const newSearchModel = currentSearch.searchModel.map(searchModel => {
      if (!searchModel.field) {
        // eslint-disable-next-line no-param-reassign
        searchModel.field = { ...newState.removedSearches[index].field };
        index++;
      }
      return searchModel;
    });
    newState.currentSearchByEntityType = getNewCurrentSearchByEntityType(newState, entityType, { ...currentSearch, searchModel: newSearchModel, skipRestoring: true });
  }
  newState.removedSearches = [];
  return newState;
}

function getNewCurrentSearchByEntityType(state: SharedSavedSearchState, entityType: EntityTypeEnum, currentSearch: SavedSearch): IDictionary<EntityTypeEnum, SavedSearch> {
  const newCurrentSearchByEntityType = state.currentSearchByEntityType.clone();
  newCurrentSearchByEntityType.setValue(entityType, currentSearch);
  return newCurrentSearchByEntityType;
}

function resetCurrentSearchByEntityType(state: SharedSavedSearchState, entityType: EntityTypeEnum): IDictionary<EntityTypeEnum, SavedSearch> {
  const newCurrentSearchByEntityType = state.currentSearchByEntityType.clone();
  newCurrentSearchByEntityType.remove(entityType);
  return newCurrentSearchByEntityType;
}
