import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuditorState } from '@app/modules/auditor/state/reducer';

const auditorFeature = createFeatureSelector<AuditorState>('auditor_feature');
const commonFeatureSelector = createSelector(auditorFeature, state => state.auditBatches.auditDetails.common);
const claimsGridFeatureSelector = createSelector(auditorFeature, state => state.auditBatches.auditDetails.auditClaimsGrid);

export const auditDetailsHeader = createSelector(commonFeatureSelector, state => state.auditDetailsHeader);
export const list = createSelector(claimsGridFeatureSelector, state => state.list);
export const agGridParams = createSelector(claimsGridFeatureSelector, state => state.agGridParams);
