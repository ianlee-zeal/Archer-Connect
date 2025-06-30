import { createReducer, combineReducers, on, Action } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { LienFinalizationRun } from '@app/models/lien-finalization/lien-finalization-run';
import { IdValue } from '@app/models';
import * as fromLienProcessingModal from '@app/modules/lien-finalization/lien-finalization-grid/lien-processing-modal/state/reducer';
import * as actions from './actions';

export interface LienFinalizationGridState {
  error: string,
  agGridParams: IServerSideGetRowsParamsExtended,
  list: LienFinalizationRun[],

  collectorOptions: IdValue[],
}

export const lienFinalizationGridState: LienFinalizationGridState = {
  error: undefined,

  agGridParams: null,
  list: [],

  collectorOptions: null,
};

const lienFinalizationGridReducer = createReducer(
  lienFinalizationGridState,

  on(actions.GetList, state => ({ ...state, error: null, list: null })),
  on(actions.GetListComplete, (state, { lienFinalizationItems, agGridParams }) => ({ ...state, list: lienFinalizationItems, agGridParams })),
  on(actions.GetListError, (state, { errorMessage }) => ({ ...state, error: errorMessage })),

  on(actions.GetCollectorsSuccess, (state, { collectorOptions }) => ({ ...state, collectorOptions })),

  on(actions.Error, (state, { errorMessage }) => ({ ...state, error: errorMessage })),
);

export interface LienFinalizationState {
  grid: LienFinalizationGridState,
  modal: fromLienProcessingModal.LienProcessingModalState,
}

export const lienFinalizationState: LienFinalizationState = {
  grid: lienFinalizationGridState,
  modal: fromLienProcessingModal.lienProcessingModalState,
};

const lienFinalizationReducer = combineReducers({
  grid: lienFinalizationGridReducer,
  modal: fromLienProcessingModal.reducer,
}, lienFinalizationState);

// we have to wrap our reducer like this or it won't compile in prod
export function reducer(state: LienFinalizationState | undefined, action: Action) {
  return lienFinalizationReducer(state, action);
}
