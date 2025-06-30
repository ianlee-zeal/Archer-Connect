import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuditorState } from '../../../state/reducer';

const auditorFeature = createFeatureSelector<AuditorState>('auditor_feature');
export const auditBatchModalState = createSelector(auditorFeature, state => state.auditBatches.modal);

export const auditBatchModalSelectors = {
  error: createSelector(auditBatchModalState, state => state.error),
  runSettings: createSelector(auditBatchModalState, state => state.auditRun?.runSettings),
  auditRun: createSelector(auditBatchModalState, state => state.auditRun),
  stage: createSelector(auditBatchModalState, state => state.stage),
  previewStatus: createSelector(auditBatchModalState, state => state.previewStatus),
  dropdownValues: createSelector(auditBatchModalState, state => state.dropdownValues),
  isClosingDisabled: createSelector(auditBatchModalState, state => state.isClosingDisabled),
  isFailed: createSelector(auditBatchModalState, state => state.isFailed),
};
