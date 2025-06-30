import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProjectsState } from '../../state/reducer';

const selectFeature = createFeatureSelector<ProjectsState>('projects_feature');
const common = createSelector(selectFeature, state => state.claimantsSummaryRollup.common);

export const gridParams = createSelector(common, state => state.gridParams);
export const advancedSearch = createSelector(selectFeature, state => state.claimantsSummaryRollup.advancedSearch);
export const claimantSummaryList = createSelector(common, state => state.claimantSummaryRollupList);
