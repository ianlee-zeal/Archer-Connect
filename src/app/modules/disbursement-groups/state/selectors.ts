import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DisbursementGroupsState } from './reducer';

const disbursementGroupsFeature = createFeatureSelector<DisbursementGroupsState>('disbursement-groups_feature');
const selectFeature = createSelector(disbursementGroupsFeature, (state: DisbursementGroupsState) => state);

export const disbursementGroupTypes = createSelector(selectFeature, (state: DisbursementGroupsState) => state.disbursementGroupTypes);
export const disbursementGroupStages = createSelector(selectFeature, (state: DisbursementGroupsState) => state.disbursementGroupStages);
export const deficiencySettingsTemplates = createSelector(selectFeature, (state: DisbursementGroupsState) => state.deficiencySettingsTemplates);
