import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromProbates from './reducer';

const probatesFeature = createFeatureSelector<fromProbates.ProbatesState>('probates_feature');
const commonFeature = createSelector(probatesFeature, state => state.common);

export const probates = createSelector(commonFeature, state => state.probates);
export const probatesGridParams = createSelector(commonFeature, state => state.probatesGridParams);
export const actionBar = createSelector(commonFeature, state => state.actionBar);
export const advancedSearch = createSelector(commonFeature, state => state.advancedSearch);
export const projectsWithProbates = createSelector(commonFeature, state => state.projectsWithProbates);
export const projectsCodesWithProbates = createSelector(commonFeature, state => state.projectsCodesWithProbates);
export const packetRequestsStages = createSelector(commonFeature, state => state.packetRequestsStages);

export const error = createSelector(commonFeature, state => state.error);
