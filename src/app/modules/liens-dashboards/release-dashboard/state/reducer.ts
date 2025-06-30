import { createReducer, on, Action } from '@ngrx/store';
import { LienTypeSummary, LienPhaseSummary, LienStatusSummary, LienPhase, IdValue, Project } from '@app/models';
import { ActionHandlersMap } from '@shared/action-bar/action-handlers-map';
import { KeyValuePair } from '@app/models/utils';
import * as actions from './actions';
import { DashboardFilters } from '@app/models/enums/dashboard-filters.enum';
import { ReleaseInGoodOrderSummary } from '@app/models/liens/release-in-good-order-summary';

export interface ReleaseDashboardState {
  typesSummary: LienTypeSummary,
  phasesSummary: LienPhaseSummary,
  stagesSummary: LienStatusSummary,
  releaseInGoodOrderSummary: ReleaseInGoodOrderSummary

  actionBar: ActionHandlersMap,
  project: Project, //Project,
  error: string,

  selectedStages: number[],
  selectedTypes: number[],
  selectedPhases: number[],
  selectedIsReleaseInGoodOrder: boolean

  filtersProjectId: number, // selected filters will apply for the project when return back from sub pages
  productPhasesList: LienPhase[],
  productTypesList: IdValue[],
  productStagesList: IdValue[],
  releaseDashboardClearActionFilters: KeyValuePair<string, string>[],
  activeFilter: DashboardFilters,

}

export const releaseDashboardState: ReleaseDashboardState = {
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
  productPhasesList: null,
  productTypesList: null,
  productStagesList: null,
  releaseDashboardClearActionFilters: null,
  activeFilter: null,
  selectedIsReleaseInGoodOrder: null,
  releaseInGoodOrderSummary: null
};

const Reducer = createReducer(
  releaseDashboardState,
  on(actions.GetStagesSummary, (state, { lienTypes, lienPhases, isReleaseInGoodOrder }) => ({ ...state, selectedTypes: lienTypes, selectedPhases: lienPhases, selectedIsReleaseInGoodOrder: isReleaseInGoodOrder, stagesSummary: null, error: null })),
  on(actions.GetStagesSummarySuccess, (state, { summary }) => ({ ...state, stagesSummary: summary, filtersProjectId: state.project && state.project.id, error: null })),

  on(actions.GetPhasesSummary, (state, { lienTypes, lienPhases, clientStages, isReleaseInGoodOrder }) => ({ ...state, selectedStages: clientStages, selectedTypes: lienTypes, selectedPhases: lienPhases, selectedIsReleaseInGoodOrder: isReleaseInGoodOrder, phasesSummary: null, error: null })),
  on(actions.GetPhasesSummarySuccess, (state, { summary }) => ({ ...state, phasesSummary: summary, filtersProjectId: state.project && state.project.id, error: null })),

  on(actions.GetProject, state => ({ ...state, project: null })),
  on(actions.GetProjectComplete, (state, { projectDetails }) => ({ ...state, project: projectDetails, error: null })),

  on(actions.GetProductPhasesList, state => ({ ...state, productPhasesList: null, error: null })),
  on(actions.GetProductPhasesListSuccess, (state, { phases }) => ({ ...state, productPhasesList: phases, error: null })),

  on(actions.GetProductTypesList, state => ({ ...state, productTypesList: null, error: null })),
  on(actions.GetProductTypesListSuccess, (state, { types }) => ({ ...state, productTypesList: types, error: null })),

  on(actions.GetProductStagesList, state => ({ ...state, productStagesList: null, error: null })),
  on(actions.GetProductStagesListSuccess, (state, { stages }) => ({ ...state, productStagesList: stages, error: null })),
  on(actions.UpdateReleaseDashboardClearActionFilters, (state, { filters }) => ({ ...state, releaseDashboardClearActionFilters: filters })),

  on(actions.ResetFilters, state => ({ ...state, activeFilter: null, selectedPhases: null, selectedStages: null, selectedTypes: null, releaseDashboardClearActionFilters: null })),
  on(actions.UpdateActiveFilter, (state, { activeFilter }) => ({ ...state, activeFilter: activeFilter })),

  on(actions.UpdateActionBar, (state, { actionBar }) => ({ ...state, actionBar })),
  on(actions.Error, (state, { errorMessage }) => ({ ...state, error: errorMessage })),

  on(actions.GetReleaseInGoodOrderSummary, (state, { }) => ({ ...state, error: null })),
  on(actions.GetReleaseInGoodOrderSummarySuccess, (state, { summary }) => ({ ...state, releaseInGoodOrderSummary: summary, error: null })),
);

export function reducer(state: ReleaseDashboardState | undefined, action: Action) {
  return Reducer(state, action);
}
