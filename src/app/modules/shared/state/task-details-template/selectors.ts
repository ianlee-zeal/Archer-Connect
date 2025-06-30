import { createSelector, createFeatureSelector } from '@ngrx/store';
import { SharedModuleState, FEATURE_NAME } from '../shared.state';

const sharedFeature = createFeatureSelector<SharedModuleState>(FEATURE_NAME);

const stateSelector = createSelector(sharedFeature, state => state.tasksDetailsTemplate);

export const taskDetailsTemplateSelectors = {
  subTasksGridParams: createSelector(stateSelector, state => state.subTasksGridParams),
  archerId: createSelector(stateSelector, state => state.archerId),
  taskCategories: createSelector(stateSelector, state => state.taskCategories),
  subTaskCategories: createSelector(stateSelector, state => state.subTaskCategories),
  priorities: createSelector(stateSelector, state => state.priorities),
  stages: createSelector(stateSelector, state => state.stages),
  teams: createSelector(stateSelector, state => state.teams),
  templates: createSelector(stateSelector, state => state.templates),
  subTemplates: createSelector(stateSelector, state => state.subTemplates),
  subTasks: createSelector(stateSelector, state => state.subTasks),
  templateId: createSelector(stateSelector, state => state.templateId),
  subTaskDetails: createSelector(stateSelector, state => state.subTaskDetails),
  subTemplateDetails: createSelector(stateSelector, state => state.subTemplateDetails),
  attachedDocuments: createSelector(stateSelector, state => state.attachedDocuments),
  attachedDocumentsInProgress: createSelector(stateSelector, state => state.attachedDocsInProgress),
};
