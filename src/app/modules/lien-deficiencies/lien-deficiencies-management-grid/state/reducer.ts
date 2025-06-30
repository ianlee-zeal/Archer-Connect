import { createReducer, combineReducers, on, Action } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import * as actions from './actions';
import { DeficiencyManagement } from '@app/models/lien-deficiencies/deficiency-management';
import { IdValue } from '@app/models';

export interface LienDeficienciesManagementGridState {
  error: string,
  agGridParams: IServerSideGetRowsParamsExtended,
  list: DeficiencyManagement[],
  deficiencyCategories: IdValue[],
}

export const lienDeficienciesManagementGridState: LienDeficienciesManagementGridState = {
  error: null,

  agGridParams: null,
  deficiencyCategories: [],
  list: [],
};

const lienDeficienciesManagementGridReducer = createReducer(
  lienDeficienciesManagementGridState,
  on(actions.GetList, state => ({ ...state, error: null, list: null })),
  on(actions.GetListComplete, (state, { lienDeficiencyManagementItems, agGridParams }) => ({ ...state, list: lienDeficiencyManagementItems, agGridParams })),
  on(actions.GetListError, (state, { errorMessage }) => ({ ...state, error: errorMessage })),
  on(actions.GetDeficiencyCategoriesComplete, (state, { deficiencyCategories }) => ({ ...state, deficiencyCategories })),
  on(actions.Error, (state, { error }) => ({ ...state, error })),
);

export interface LienDeficienciesManagementState {
  grid: LienDeficienciesManagementGridState,
}

export const lienDeficienciesManagementState: LienDeficienciesManagementState = { grid: lienDeficienciesManagementGridState };

const lienDeficienciesReducer = combineReducers({ grid: lienDeficienciesManagementGridReducer }, lienDeficienciesManagementState);

// we have to wrap our reducer like this or it won't compile in prod
export function reducer(state: LienDeficienciesManagementState | undefined, action: Action) {
  return lienDeficienciesReducer(state, action);
}
