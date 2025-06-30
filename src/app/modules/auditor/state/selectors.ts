import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AuditorState } from './reducer';

const featureSelector = createFeatureSelector<AuditorState>('auditor_feature');
const commonStateSelector = createSelector(featureSelector, state => state.common);

export const actionBar = createSelector(commonStateSelector, state => state.actionBar);
export const error = createSelector(commonStateSelector, state => state.error);

export const auditorSelector = {
  common: commonStateSelector,
  auditBatches: createSelector(featureSelector, state => state.auditBatches),
};
