import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LienState } from '../../state/reducer';
import { FEATURE_NAME } from '../../state';

const dashboardFeature = createFeatureSelector<LienState>(FEATURE_NAME);
const dashboardFeatureSelector = createSelector(dashboardFeature, state => state.releaseDashboard);

export const stagesSummary = createSelector(dashboardFeatureSelector, state => state.stagesSummary);
export const phasesSummary = createSelector(dashboardFeatureSelector, state => state.phasesSummary);
export const releaseInGoodOrderSummary = createSelector(dashboardFeatureSelector, state => state.releaseInGoodOrderSummary);

export const selectedStages = createSelector(dashboardFeatureSelector, state => state.selectedStages);
export const selectedTypes = createSelector(dashboardFeatureSelector, state => state.selectedTypes);
export const selectedPhases = createSelector(dashboardFeatureSelector, state => state.selectedPhases);
export const selectedIsReleaseInGoodOrder = createSelector(dashboardFeatureSelector, state => state.selectedIsReleaseInGoodOrder);
export const filtersProjectId = createSelector(dashboardFeatureSelector, state => state.filtersProjectId);

export const releaseDashboardClearActionFilters = createSelector(dashboardFeatureSelector, state => state.releaseDashboardClearActionFilters);

export const actionBar = createSelector(dashboardFeatureSelector, state => state.actionBar);
export const projectDetails = createSelector(dashboardFeatureSelector, state => state.project);
export const error = createSelector(dashboardFeatureSelector, state => state.error);

export const productPhasesList = createSelector(dashboardFeatureSelector, state => state.productPhasesList);
export const productTypesList = createSelector(dashboardFeatureSelector, state => state.productTypesList);
export const productStagesList = createSelector(dashboardFeatureSelector, state => state.productStagesList);

export const activeFilter = createSelector(dashboardFeatureSelector, state => state.activeFilter);
