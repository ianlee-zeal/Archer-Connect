import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromTaskTemplates from './reducer';
import { featureName } from './actions';

const taskTemplates = createFeatureSelector<fromTaskTemplates.TaskTemplatesState>(featureName);

export const gridParams = createSelector(taskTemplates, state => state.gridParams);
export const templateDetails = createSelector(taskTemplates, state => state.templateDetails);
