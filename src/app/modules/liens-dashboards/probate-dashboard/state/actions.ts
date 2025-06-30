import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { ActionHandlersMap } from '@shared/action-bar/action-handlers-map';
import { LienStatusSummary, LienPhaseSummary, LienTypeSummary, LienPhase, IdValue } from '@app/models';
import { KeyValuePair } from '@app/models/utils';
import { DashboardFilters } from '@app/models/enums/dashboard-filters.enum';

const featureName = '[ProbateDashboard]';

export const GetStatusesSummary = createAction(`${featureName} Get Statuses Summary`, props<{ rootProductCategoryId: number, projectId: number, lienTypes?: number[], lienPhases?: number[], bypassSpinner?: boolean }>());
export const GetStatusesSummarySuccess = createAction(`${featureName} Get Statuses Summary Success`, props<{ summary: LienStatusSummary }>());

export const GetPhasesSummary = createAction(`${featureName} Get Phases Summary`, props<{ rootProductCategoryId: number, projectId: number, lienTypes?: number[], lienPhases?: number[], clientStatuses?: number[] }>());
export const GetPhasesSummarySuccess = createAction(`${featureName} Get Phases Summary Success`, props<{ summary: LienPhaseSummary }>());

export const GetTypesSummary = createAction(`${featureName} Get Types Summary`, props<{ rootProductCategoryId: number, projectId: number, lienPhases?: number[], clientStatuses?: number[] }>());
export const GetTypesSummarySuccess = createAction(`${featureName} Get Types Summary Success`, props<{ summary: LienTypeSummary }>());

export const GetProject = createAction(`${featureName} Get Project`, props<{ id: number }>())
export const GetProjectComplete = createAction(`${featureName} Get Gase Complete`, props<{ projectDetails: any }>());

export const GetProductPhasesList = createAction(`${featureName} Get Product Phases List`, props<{ productCategoryId: number }>());
export const GetProductPhasesListSuccess = createAction(`${featureName} Get Product Phases List Success`, props<{ phases: LienPhase[] }>());

export const GetProductTypesList = createAction(`${featureName} Get Product Types List`, props<{ productCategoryId: number }>());
export const GetProductTypesListSuccess = createAction(`${featureName} Get Product Types List Success`, props<{ types: IdValue[] }>());

export const GetProductStagesList = createAction(`${featureName} Get Product Statuses List`, props<{ productCategoryId: number }>());
export const GetProductStagesListSuccess = createAction(`${featureName} Get Product Statuses List Success`, props<{ stages: IdValue[] }>());

export const UpdateProbateDashboardClearActionFilters = createAction(`${featureName} Update Probate Dashboard Clear Action`, props<{ filters: KeyValuePair<string, string>[] }>());

export const ResetFilters = createAction(`${featureName} Reset Filters`);
export const UpdateActiveFilter = createAction(`${featureName} Update Active Filter`, props<{ activeFilter: DashboardFilters }>());

export const UpdateActionBar = createAction(`${featureName} Update Action Bar`, props<{ actionBar: ActionHandlersMap }>());
export const Back = createAction(`${featureName} Back`, props<{ projectId: number }>())
export const Error = createAction(`${featureName} Error`, props<{ errorMessage: string, agGridParams?: IServerSideGetRowsParamsExtended }>());
