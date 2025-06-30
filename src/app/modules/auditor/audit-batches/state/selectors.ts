import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuditorState } from '../../state/reducer';

const auditorFeature = createFeatureSelector<AuditorState>('auditor_feature');
const auditorFeatureSelector = createSelector(auditorFeature, state => state.auditBatches);

export const auditBatchesList = createSelector(auditorFeatureSelector, state => state.grid.list);
export const agGridParams = createSelector(auditorFeatureSelector, state => state.grid.agGridParams);

export const collectorOptions = createSelector(auditorFeatureSelector, state => state.grid.collectorOptions);
