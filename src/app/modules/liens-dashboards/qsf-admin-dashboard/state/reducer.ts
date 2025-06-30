import { createReducer, on, Action } from '@ngrx/store';
import { LienStatusSummary, Project } from '@app/models';
import { ActionHandlersMap } from '@shared/action-bar/action-handlers-map';
import { KeyValuePair } from '@app/models/utils';
import { DashboardFilters } from '@app/models/enums/dashboard-filters.enum';
import { TotalPaymentChartData } from '@app/models/liens/total-payment-chart-data';
import { QsfAdminPhaseSummary } from '@app/models/liens/qsf-admin-phase-summary';
import * as actions from './actions';

export interface QsfAdminDashboardState {
  totalPaymentChartData: TotalPaymentChartData,
  phasesSummary: QsfAdminPhaseSummary,
  statusesSummary: LienStatusSummary,
  actionBar: ActionHandlersMap,
  project: Project,
  error: string,
  selectedStatuses: number[],
  selectedPhases: number[],
  filtersProjectId: number, // selected filters will apply for the project when return back from sub pages
  qsfAdminDashboardClearActionFilters: KeyValuePair<string, string>[],
  activeFilter: DashboardFilters,
  isDashboardLoaded: boolean;
}

export const qsfAdminDashboardState: QsfAdminDashboardState = {
  phasesSummary: null,
  statusesSummary: null,
  totalPaymentChartData: null,
  actionBar: null,
  project: null,
  error: null,
  selectedStatuses: null,
  selectedPhases: null,
  filtersProjectId: null,
  qsfAdminDashboardClearActionFilters: null,
  activeFilter: null,
  isDashboardLoaded: false,
};

const Reducer = createReducer(
  qsfAdminDashboardState,
  on(actions.GetStatusesSummary, (state, { lienPhases }) => ({ ...state, selectedPhases: lienPhases, statusesSummary: null, error: null, isDashboardLoaded: false })),
  on(actions.GetStatusesSummarySuccess, (state, { summary }) => ({ ...state, statusesSummary: summary, filtersProjectId: state.project && state.project.id, error: null, isDashboardLoaded: true })),

  on(actions.GetPhasesSummary, (state, { lienPhases, clientStatuses }) => ({ ...state, selectedStatuses: clientStatuses, selectedPhases: lienPhases, phasesSummary: null, error: null, isDashboardLoaded: false })),
  on(actions.GetPhasesSummarySuccess, (state, { summary }) => ({ ...state, phasesSummary: summary, filtersProjectId: state.project && state.project.id, error: null, isDashboardLoaded: true })),

  on(actions.GetTotalPaymentChartData, state => ({ ...state, totalPaymentChartData: null, error: null })),
  on(actions.GetTotalPaymentChartDataSuccess, (state, { summary }) => ({ ...state, totalPaymentChartData: summary, filtersProjectId: state.project && state.project.id, error: null })),

  on(actions.UpdateQsfAdminDashboardClearActionFilters, (state, { filters }) => ({ ...state, qsfAdminDashboardClearActionFilters: filters })),

  on(actions.ResetFilters, state => ({ ...state, activeFilter: null, selectedPhases: null, selectedStatuses: null, qsfAdminDashboardClearActionFilters: null })),
  on(actions.UpdateActiveFilter, (state, { activeFilter }) => ({ ...state, activeFilter })),
  on(actions.ClearChartData, state => ({ ...state,
    activeFilter: null,
    selectedPhases: null,
    selectedStatuses: null,
    qsfAdminDashboardClearActionFilters: null,
    phasesSummary: null,
    statusesSummary: null,
    totalPaymentChartData: null,
  })),

  on(actions.UpdateActionBar, (state, { actionBar }) => ({ ...state, actionBar })),

  on(actions.Error, (state, { errorMessage }) => ({ ...state, error: errorMessage })),
);

export function reducer(state: QsfAdminDashboardState | undefined, action: Action): QsfAdminDashboardState {
  return Reducer(state, action);
}
