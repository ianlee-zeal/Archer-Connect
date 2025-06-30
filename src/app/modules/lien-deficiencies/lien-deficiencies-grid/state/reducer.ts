import { createReducer, combineReducers, on, Action } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { IntegrationJob } from '@app/models/lien-deficiencies/integration-job';
import { Status } from '@app/models/status';
import * as actions from './actions';

export interface LienDeficienciesGridState {
  error: string,
  agGridParams: IServerSideGetRowsParamsExtended,
  list: IntegrationJob[],
  isRunStarted: boolean,
  runIntegrationJob: IntegrationJob,
}

export const lienDeficienciesGridState: LienDeficienciesGridState = {
  error: null,

  agGridParams: null,
  list: [],
  isRunStarted: false,
  runIntegrationJob: IntegrationJob.toModel({}),
};

const lienDeficienciesGridReducer = createReducer(
  lienDeficienciesGridState,

  on(actions.GetList, state => ({ ...state, error: null, list: null })),
  on(actions.GetListComplete, (state, { lienDeficiencyItems, agGridParams }) => ({ ...state, list: lienDeficiencyItems, agGridParams })),
  on(actions.GetListError, (state, { errorMessage }) => ({ ...state, error: errorMessage })),

  on(actions.StartRun, state => ({
    ...state,
    error: null,
    isRunStarted: true,
  })),

  on(actions.StartRunSuccess, (state, { integrationDto }) => ({
    ...state,
    runIntegrationJob: {
      ...state.runIntegrationJob,
      id: integrationDto.id,
      createdBy: integrationDto.createdBy,
      createdDate: integrationDto.createdDate,
    },
  })),

  on(actions.SetStatus, (state, { status }) => ({
    ...state,
    runIntegrationJob: {
      ...state.runIntegrationJob,
      status: status ? Status.toModel(status) : null,
    },
  })),

  on(actions.Reset, state => ({
    ...state,
    runIntegrationJob: {
      ...state.runIntegrationJob,
      resultDocumentId: null,
      id: 0,
      createdDate: null,
      status: null,
      createdBy: null,
    },
    isRunStarted: false,
  })),

  on(actions.Error, (state, { error }) => ({ ...state, error })),
);

export interface LienDeficienciesState {
  grid: LienDeficienciesGridState,
}

export const lienDeficienciesState: LienDeficienciesState = { grid: lienDeficienciesGridState };

const lienDeficienciesReducer = combineReducers({ grid: lienDeficienciesGridReducer }, lienDeficienciesState);

// we have to wrap our reducer like this or it won't compile in prod
export function reducer(state: LienDeficienciesState | undefined, action: Action) {
  return lienDeficienciesReducer(state, action);
}
