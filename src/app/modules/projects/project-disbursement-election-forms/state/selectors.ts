import { createFeatureSelector, createSelector } from '@ngrx/store';

import { ElectionFormsState } from './reducer';

const selectFeature = createFeatureSelector<ElectionFormsState>('projects_feature');
export const agGridParams = createSelector(selectFeature, state => state.agGridParams);
