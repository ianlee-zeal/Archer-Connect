/* eslint-disable @typescript-eslint/no-use-before-define */
import { createReducer, on, Action } from '@ngrx/store';

import { Dictionary, IDictionary } from '@app/models/utils/dictionary';

import { EntityTypeEnum } from '@app/models/enums';
import { IdValue } from '@app/models';
import * as rootActions from './root.actions';
import { RootState, initialState } from './root.state';

// main reducer function
const rootReducerConst = createReducer(
  initialState,
  on(rootActions.LoadDataComplete, (state, { data }) => ({
    ...state,
    dropdown_values: data[0],
    error: null,
  })),
  on(rootActions.GetEntityStatuses, state => ({ ...state, entityStatuses: null })),
  on(rootActions.GetEntityStatusesComplete, (state, { statuses }) => ({ ...state, entityStatuses: statuses })),
  on(rootActions.Error, (state, { error }) => ({ ...state, error })),
  on(rootActions.GetGridSettings, (state, { key }) => ({
    ...state,
    gridSettings: {
      ...state.gridSettings,
      [key]: null,
    },
  })),
  on(rootActions.GetGridSettingsSuccess, (state, { key, data }) => ({
    ...state,
    gridSettings: {
      ...state.gridSettings,
      [key]: data,
    },
  })),
  on(rootActions.SetGridSettingsSuccess, (state, { key, data }) => ({
    ...state,
    gridSettings: {
      ...state.gridSettings,
      [key]: data,
    },
  })),

  on(rootActions.SetGridLocalData, (state, { gridId, gridLocalData }) => ({
    ...state,
    gridLocalData: {
      ...state.gridLocalData,
      [gridId]: {
        ...state.gridLocalData[gridId],
        ...gridLocalData,
      },
    },
  })),
  on(rootActions.SetAllRowSelected, (state, { gridId, isAllRowSelected }) => ({
    ...state,
    gridLocalData: {
      ...state.gridLocalData,
      [gridId]: {
        ...state.gridLocalData[gridId],
        isAllRowSelected,
        selectedRecordsIds: null,
      },
    },
  })),
  on(rootActions.GridRowToggleCheckbox, (state, { gridId, selectedRecordsIds }) => ({
    ...state,
    gridLocalData: {
      ...state.gridLocalData,
      [gridId]: {
        ...state.gridLocalData[gridId],
        selectedRecordsIds,
      },
    },
  })),
  on(rootActions.ClearSelectedRecordsState, (state, { gridId }) => ({
    ...state,
    gridLocalData: {
      ...state.gridLocalData,
      [gridId]: {
        ...state.gridLocalData[gridId],
        selectedRecordsIds: null,
        isAllRowSelected: false,
      },
    },
  })),
  on(rootActions.ClearGridLocalData, (state, { gridId }) => ({
    ...state,
    gridLocalData: { ...state.gridLocalData, [gridId]: null },
  })),
  on(rootActions.LoadingStarted, (state, { actionNames }) => ({
    ...state,
    loadingInProgress: loadingProgressStartedReducer(state, actionNames),
  })),
  on(rootActions.LoadingFinished, (state, { actionName }) => ({
    ...state,
    loadingInProgress: loadingProgressFinishedReducer(state, actionName),
  })),
  on(rootActions.ResetLoading, state => ({
    ...state,
    loadingInProgress: new Dictionary<string, boolean>(),
  })),
  on(rootActions.LoadFromStorage, state => ({ ...state, gridStorageData: null })),
  on(rootActions.LoadFromStorageSuccess, (state, { data }) => ({ ...state, gridStorageData: data })),
  on(rootActions.SaveToStorageSuccess, (state, { data }) => ({ ...state, gridStorageData: data })),
  on(rootActions.ClearStorage, state => ({ ...state, gridStorageData: null })),
  on(rootActions.GetDropdownOptionsSuccess, (state, { key, values }) => ({ ...state, dropdown_values: { ...state.dropdown_values, [key]: values } })),
  on(rootActions.GetStatusesSuccess, (state, { entityType, statuses }) => ({
    ...state,
    statusesByEntityType: getNewStatusesByEntityType(state, entityType, statuses),
  })),
  on(rootActions.QuickSearchSuccess, (state, { foundItems }) => ({ ...state, quickSearchResults: foundItems })),
  on(rootActions.QuickSearchClear, state => ({ ...state, quickSearchResults: null })),
  on(rootActions.GetUserBannerCompleted, (state, { message }) => ({ ...state, banner: message, isBannerClosed: false })),
  on(rootActions.InitializeBanner, state => ({ ...state, isBannerClosed: false })),
  on(rootActions.ClearBanner, state => ({ ...state, banner: null, isBannerClosed: true })),
);

// we have to wrap our reducer like this or it won't compile in prod
export function rootReducer(state: RootState | undefined, action: Action) {
  return rootReducerConst(state, action);
}

function initNewLoadingProgressState(state: RootState): IDictionary<string, boolean> {
  return state.loadingInProgress ? new Dictionary(state.loadingInProgress.items()) : new Dictionary<string, boolean>();
}

function loadingProgressStartedReducer(state: RootState, actionNames: string[]): IDictionary<string, boolean> {
  const newLoadingInProgressData = initNewLoadingProgressState(state);
  actionNames.map(actionName => newLoadingInProgressData.setValue(actionName, true));
  return newLoadingInProgressData;
}

function loadingProgressFinishedReducer(state: RootState, actionName: string): IDictionary<string, boolean> {
  const newLoadingInProgressData = initNewLoadingProgressState(state);
  newLoadingInProgressData.remove(actionName);
  return newLoadingInProgressData;
}

function getNewStatusesByEntityType(state: RootState, entityType: EntityTypeEnum, statuses: IdValue[]): IDictionary<EntityTypeEnum, IdValue[]> {
  const newStatusesByEntityType = state.statusesByEntityType.clone();
  newStatusesByEntityType.setValue(entityType, statuses);
  return newStatusesByEntityType;
}
