import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LienState } from '../../state/reducer';
import { FEATURE_NAME } from '../../state';

const dashboardFeature = createFeatureSelector<LienState>(FEATURE_NAME);
const dashboardFeatureSelector = createSelector(dashboardFeature, state => state.probateDashboard);

export const statusesSummary = createSelector(dashboardFeatureSelector, state => state.statusesSummary);
export const phasesSummary = createSelector(dashboardFeatureSelector, state => state.phasesSummary);
export const typesSummary = createSelector(dashboardFeatureSelector, state => state.typesSummary);

export const selectedStatuses = createSelector(dashboardFeatureSelector, state => state.selectedStatuses);
export const selectedTypes = createSelector(dashboardFeatureSelector, state => state.selectedTypes);
export const selectedPhases = createSelector(dashboardFeatureSelector, state => state.selectedPhases);
export const filtersProjectId = createSelector(dashboardFeatureSelector, state => state.filtersProjectId);

export const actionBar = createSelector(dashboardFeatureSelector, state => state.actionBar);
export const projectDetails = createSelector(dashboardFeatureSelector, state => state.project);
export const error = createSelector(dashboardFeatureSelector, state => state.error);

export const productPhasesList = createSelector(dashboardFeatureSelector, state => state.productPhasesList);
export const productTypesList = createSelector(dashboardFeatureSelector, state => state.productTypesList);
export const productStagesList = createSelector(dashboardFeatureSelector, state => state.productStagesList);

export const probateDashboardClearActionFilters = createSelector(dashboardFeatureSelector, state => state.probateDashboardClearActionFilters);

export const activeFilter = createSelector(dashboardFeatureSelector, state => state.activeFilter);