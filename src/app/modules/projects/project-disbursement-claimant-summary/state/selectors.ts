import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProjectsState } from '../../state/reducer';

const selectFeature = createFeatureSelector<ProjectsState>('projects_feature');
const common = createSelector(selectFeature, state => state.claimantsSummary.common);

export const gridParams = createSelector(common, state => state.gridParams);
export const advancedSearch = createSelector(selectFeature, state => state.claimantsSummary.advancedSearch);
export const paymentTypesForRequest = createSelector(common, state => state.paymentTypesForRequest);
export const paymentTypes = createSelector(common, state => state.paymentTypes);
export const claimantSummaryList = createSelector(common, state => state.claimantSummaryList);
