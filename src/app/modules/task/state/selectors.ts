import { createSelector, createFeatureSelector } from '@ngrx/store';
import * as fromTask from './reducer';

const featureSelector = createFeatureSelector<fromTask.TaskState>('task_feature');

const stateSelector = createSelector(featureSelector, state => state);

export const entireState = stateSelector;
export const actionBar = createSelector(stateSelector, state => state.actionBar);

export const error = createSelector(stateSelector, state => state.error);

export const taskDetails = createSelector(stateSelector, state => state.taskDetails);

export const currentUserTeams = createSelector(stateSelector, state => state.currentUserTeams);

export const currentTeamMembers = createSelector(stateSelector, state => state.currentTeamMembers);

export const currentWidgetsData = createSelector(stateSelector, state => state.currentWidgetsData);

export const attachedDocuments = createSelector(stateSelector, state => state.attachedDocuments);
export const attachedDocumentsCount = createSelector(stateSelector, state => state.attachedDocumentsCount);
export const allTaskDocuments = createSelector(stateSelector, state => state.allTaskDocuments);
