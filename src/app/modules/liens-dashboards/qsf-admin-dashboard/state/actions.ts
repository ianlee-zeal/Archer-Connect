import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { ActionHandlersMap } from '@shared/action-bar/action-handlers-map';
import { LienStatusSummary } from '@app/models';
import { KeyValuePair } from '@app/models/utils';
import { DashboardFilters } from '@app/models/enums/dashboard-filters.enum';
import { TotalPaymentChartData } from '@app/models/liens/total-payment-chart-data';
import { QsfAdminPhaseSummary } from '@app/models/liens/qsf-admin-phase-summary';

const featureName = '[QsfAdminDashboard]';

export const GetStatusesSummary = createAction(`${featureName} Get Statuses Summary`, props<{ rootProductCategoryId: number, projectId: number, lienPhases?: number[], bypassSpinner?: boolean }>());
export const GetStatusesSummarySuccess = createAction(`${featureName} Get Statuses Summary Success`, props<{ summary: LienStatusSummary }>());

export const GetPhasesSummary = createAction(`${featureName} Get Phases Summary`, props<{ rootProductCategoryId: number, projectId: number, lienPhases?: number[], clientStatuses?: number[], bypassSpinner?: boolean }>());
export const GetPhasesSummarySuccess = createAction(`${featureName} Get Phases Summary Success`, props<{ summary: QsfAdminPhaseSummary }>());

export const GetTotalPaymentChartData = createAction(`${featureName} Get Total Payment Chart Data`, props<{ projectId: number, bypassSpinner?: boolean }>());
export const GetTotalPaymentChartDataSuccess = createAction(`${featureName} Get Total Payment Chart Data Success`, props<{ summary: TotalPaymentChartData }>());

export const UpdateQsfAdminDashboardClearActionFilters = createAction(`${featureName} Update Qsf Admin Dashboard Clear Action`, props<{ filters: KeyValuePair<string, string>[] }>());

export const ClearChartData = createAction(`${featureName} Clear Chart Data`);
export const ResetFilters = createAction(`${featureName} Reset Filters`);
export const UpdateActiveFilter = createAction(`${featureName} Update Active Filter`, props<{ activeFilter: DashboardFilters }>());

export const UpdateActionBar = createAction(`${featureName} Update Action Bar`, props<{ actionBar: ActionHandlersMap }>());

export const Error = createAction(`${featureName} Error`, props<{ errorMessage: string, agGridParams?: IServerSideGetRowsParamsExtended }>());
