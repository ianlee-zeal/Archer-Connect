import { IdValue, ProbateDetails } from '@app/models';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import * as advancedSearchState from '@app/modules/shared/state/advanced-search/reducer';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { createReducer, on, Action, combineReducers } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import * as actions from './actions';

export interface ProbatesCommonState {
  probates: ProbateDetails[],
  probatesGridParams: IServerSideGetRowsParamsExtended,
  error: string,
  actionBar: ActionHandlersMap,
  advancedSearch: advancedSearchState.AdvancedSearchState,
  projectsWithProbates: SelectOption[],
  projectsCodesWithProbates: SelectOption[],
  packetRequestsStages: IdValue[]
}

const initialProbatesCommonState: ProbatesCommonState = {
  probates: null,
  probatesGridParams: null,
  error: null,
  actionBar: null,
  advancedSearch: advancedSearchState.initialState,
  projectsWithProbates: null,
  projectsCodesWithProbates: null,
  packetRequestsStages: null,
};

const probatesCommonReducer = createReducer(
  initialProbatesCommonState,
  on(actions.GetProbatesList, state => ({ ...state, pending: true, error: null, projects: null })),
  on(actions.GetProbatesListSuccess, (state, { probates, probatesGridParams }) => ({ ...state, pending: false, probates, probatesGridParams })),

  on(actions.UpdateProbatesListActionBar, (state, { actionBar }) => ({ ...state, actionBar })),
  on(actions.GetProjectsWithProbatesSuccess, (state, { projectsWithProbates }) => ({ ...state, projectsWithProbates })),
  on(actions.GetProjectsCodesWithProbatesSuccess, (state, { projectsCodesWithProbates }) => ({ ...state, projectsCodesWithProbates })),
  on(actions.GetPacketRequestsStagesSuccess, (state, { packetRequestsStages }) => ({ ...state, packetRequestsStages })),
  on(actions.Error, (state, { error }) => ({ ...state, error })),
);

export interface ProbatesState {
  common: ProbatesCommonState,
}

const initialState: ProbatesState = { common: initialProbatesCommonState };

const probatesReducer = combineReducers({ common: probatesCommonReducer }, initialState);

export function ProbatesReducer(state: ProbatesState | undefined, action: Action) {
  return probatesReducer(state, action);
}
