import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CommunicationHubState } from './reducer';

const selectFeature = createFeatureSelector<CommunicationHubState>('communication_hub_feature');
export const page = createSelector(selectFeature, state => state.page);
export const issue = createSelector(selectFeature, state => state.issue);
export const statuses = createSelector(selectFeature, state => state.statuses);
export const requestTypes = createSelector(selectFeature, state => state.requestTypes);
export const comments = createSelector(selectFeature, state => state.comments);
export const composeFields = createSelector(selectFeature, state => state.requestTypeFields);
export const participants = createSelector(selectFeature, state => state.participants);
export const agents = createSelector(selectFeature, state => state.agents);
export const availableJiraProjects = createSelector(selectFeature, state => state.availableJiraProjects);
export const availableJiraProjectsLoading = createSelector(selectFeature, state => state.availableJiraProjectsLoading);
export const projectsList = createSelector(selectFeature, state => state.projectsList);
export const isLoading = createSelector(selectFeature, state => state.isLoading);
export const unresolvedCount = createSelector(selectFeature, state => state.unresolvedCount);
export const responseNeededCount = createSelector(selectFeature, state => state.responseNededCount);