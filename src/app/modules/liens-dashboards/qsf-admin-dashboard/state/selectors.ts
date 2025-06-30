import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LienState } from '../../state/reducer';
import { FEATURE_NAME } from '../../state';

const dashboardFeature = createFeatureSelector<LienState>(FEATURE_NAME);
const dashboardFeatureSelector = createSelector(dashboardFeature, state => state.qsfAdminDashboard);

export const statusesSummary = createSelector(dashboardFeatureSelector, state => state.statusesSummary);
export const phasesSummary = createSelector(dashboardFeatureSelector, state => state.phasesSummary);
export const totalPaymentChartData = createSelector(dashboardFeatureSelector, state => state.totalPaymentChartData);

export const selectedStatuses = createSelector(dashboardFeatureSelector, state => state.selectedStatuses);
export const selectedPhases = createSelector(dashboardFeatureSelector, state => state.selectedPhases);
export const filtersProjectId = createSelector(dashboardFeatureSelector, state => state.filtersProjectId);

export const actionBar = createSelector(dashboardFeatureSelector, state => state.actionBar);

export const qsfAdminDashboardClearActionFilters = createSelector(dashboardFeatureSelector, state => state.qsfAdminDashboardClearActionFilters);

export const activeFilter = createSelector(dashboardFeatureSelector, state => state.activeFilter);

export const isDashboardLoaded = createSelector(dashboardFeatureSelector, state => state.isDashboardLoaded);