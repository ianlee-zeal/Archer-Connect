import { combineReducers, createReducer, on, Action } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import * as finalizationDetailsActions from './actions';
import { LienFinalizationRun } from '@app/models/lien-finalization/lien-finalization-run';
import { LienFinalizationDetail } from '@app/models/lien-finalization/lien-finalization-detail';

export interface FinalizationDetailsCommonState {
  error: string,

  finalizationDetailsHeader: LienFinalizationRun;
}

export const finalizationDetailsCommonState: FinalizationDetailsCommonState = {
  error: undefined,

  finalizationDetailsHeader: null,
};

const finalizationDetailsCommonReducer = createReducer(
  finalizationDetailsCommonState,

  on(finalizationDetailsActions.GetFinalizationDetails, state => ({ ...state, error: null, finalizationDetailsHeader: null })),
  on(finalizationDetailsActions.GetFinalizationDetailsComplete, (state, { item }) => ({ ...state, finalizationDetailsHeader: item })),
  on(finalizationDetailsActions.ResetFinalizationDetails, state => ({ ...state, finalizationDetailsHeader: null })),
  on(finalizationDetailsActions.Error, (state, { errorMessage }) => ({ ...state, error: errorMessage })),
);

export interface FinalizationDetailsGridState {
  agGridParams: IServerSideGetRowsParamsExtended,
  list: LienFinalizationDetail[],
}

export const finalizationDetailsGridState: FinalizationDetailsGridState = {
  agGridParams: null,
  list: [],
};

const finalizationDetailsGridReducer = createReducer(
  finalizationDetailsGridState,

  on(finalizationDetailsActions.GetFinalizationDetailsGrid, state => ({ ...state, error: null, list: null })),
  on(finalizationDetailsActions.GetFinalizationDetailsGridComplete, (state, { finalizationDetails, agGridParams }) => ({ ...state, list: finalizationDetails, agGridParams })),
  on(finalizationDetailsActions.GetFinalizationDetailsGridError, (state, { errorMessage }) => ({ ...state, error: errorMessage })),
);

export interface FinalizationDetailsState {
  common: FinalizationDetailsCommonState,
  finalizationDetailsGrid: FinalizationDetailsGridState,
}

export const finalizationDetailsState: FinalizationDetailsState = {
  common: finalizationDetailsCommonState,
  finalizationDetailsGrid: finalizationDetailsGridState,
};

const finalizationDetailsReducer = combineReducers({
  common: finalizationDetailsCommonReducer,
  finalizationDetailsGrid: finalizationDetailsGridReducer,
}, finalizationDetailsState);

// we have to wrap our reducer like this or it won't compile in prod
export function reducer(state: FinalizationDetailsState | undefined, action: Action) {
  return finalizationDetailsReducer(state, action);
}
