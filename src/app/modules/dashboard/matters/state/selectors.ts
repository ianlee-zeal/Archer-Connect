import { createSelector, createFeatureSelector } from '@ngrx/store';
import * as matterReducer from './reducer';

const featureSelector = createFeatureSelector<matterReducer.MatterState>('matter_feature');

const common = createSelector(featureSelector, state => state.common);

export const error = createSelector(common, state => state.error);
export const actionBar = createSelector(common, state => state.actionBar);
export const agGridParams = createSelector(common, state => state.agGridParams);
export const matter = createSelector(common, state => state.matter);
