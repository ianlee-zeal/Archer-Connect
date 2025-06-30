import { createReducer, on, Action } from '@ngrx/store';
import { LienTypeSummary, LienPhaseSummary, LienStatusSummary, LienPhase, IdValue, Project } from '@app/models';
import { ActionHandlersMap } from '@shared/action-bar/action-handlers-map';
import { KeyValuePair } from '@app/models/utils';
import * as actions from './actions';
import { DashboardFilters } from '@app/models/enums/dashboard-filters.enum';

export interface BankruptcyDashboardState {
  typesSummary: LienTypeSummary,
  phasesSummary: LienPhaseSummary,
  stagesSummary: LienStatusSummary,
  actionBar: ActionHandlersMap,
  project: Project,
  error: string,
  selectedStages: number[],
  selectedTypes: number[],
  selectedPhases: number[],
  filtersProjectId: number, // selected filters will apply for the project when return back from sub pages
  productPhasesList:LienPhase[],
  productTypesList: IdValue[],
  productStagesList: IdValue[],
  bankruptcyDashboardClearActionFilters: KeyValuePair<string, string>[],
  activeFilter: DashboardFilters
}

export const bankruptcyDashboardState: BankruptcyDashboardState = {
  phasesSummary: null,
  stagesSummary: null,
  typesSummary: null,
  actionBar: null,
  project: null,
  error: null,
  selectedStages: null,
  selectedTypes: null,
  selectedPhases: null,
  filtersProjectId: null,
  productPhasesList:null,
  productTypesList:null,
  productStagesList:null,
  bankruptcyDashboardClearActionFilters: null,
  activeFilter: null
};

const Reducer = createReducer(
  bankruptcyDashboardState,
  on(actions.GetStagesSummary, (state, { lienTypes, lienPhases }) => ({ ...state, selectedTypes: lienTypes, selectedPhases: lienPhases, stagesSummary: null, error: null })),
  on(actions.GetStagesSummarySuccess, (state, { summary }) => ({ ...state, stagesSummary: summary, filtersProjectId: state.project && state.project.id, error: null })),

  on(actions.GetPhasesSummary, (state, { lienTypes, lienPhases, clientStages }) => ({ ...state, selectedStages: clientStages, selectedTypes: lienTypes, selectedPhases: lienPhases, phasesSummary: null, error: null })),
  on(actions.GetPhasesSummarySuccess, (state, { summary }) => ({ ...state, phasesSummary: summary, filtersProjectId: state.project && state.project.id, error: null })),

  on(actions.GetTypesSummary, (state, { lienPhases, clientStages }) => ({ ...state, selectedStages: clientStages, selectedPhases: lienPhases, typesSummary: null, error: null })),
  on(actions.GetTypesSummarySuccess, (state, { summary }) => ({ ...state, typesSummary: summary, filtersProjectId: state.project && state.project.id, error: null })),

  on(actions.GetProject, state => ({ ...state, project: null})),
  on(actions.GetProjectComplete, (state, { projectDetails }) => ({ ...state, project: projectDetails, error: null })),

  on(actions.GetProductPhasesList, state => ({ ...state, productPhasesList: null, error: null })),
  on(actions.GetProductPhasesListSuccess, (state, { phases }) => ({ ...state, productPhasesList:phases , error: null })),

  on(actions.GetProductTypesList, state => ({ ...state, productTypesList: null, error: null })),
  on(actions.GetProductTypesListSuccess, (state, { types }) => ({ ...state, productTypesList:types , error: null })),

  on(actions.GetProductStagesList, state => ({ ...state, productStagesList: null, error: null })),
  on(actions.GetProductStagesListSuccess, (state, { stages }) => ({ ...state, productStagesList:stages , error: null })),

  on(actions.ResetFilters, state => ({ ...state, activeFilter: null, selectedPhases: null, selectedStages: null, selectedTypes: null, bankruptcyDashboardClearActionFilters: null })),
  on(actions.UpdateActiveFilter, (state, { activeFilter }) => ({ ...state, activeFilter: activeFilter })),

  on(actions.UpdateActionBar, (state, { actionBar }) => ({ ...state, actionBar })),
  on(actions.UpdateBankruptcyDashboardClearActionFilters, (state, { filters }) => ({ ...state, bankruptcyDashboardClearActionFilters: filters })),
  on(actions.Error, (state, { errorMessage }) => ({ ...state, error: errorMessage })),
);

export function reducer(state: BankruptcyDashboardState | undefined, action: Action) {
  return Reducer(state, action);
}
