import { createSelector, createFeatureSelector } from '@ngrx/store';
import { DeficienciesSettingState } from '../../state/reducers';
import { FEATURE_NAME } from '../../state';
import { DeficienciesTemplateDetailsState } from './reducers';

const featureSelector = createFeatureSelector<DeficienciesSettingState>(FEATURE_NAME);
const selectFeature = createSelector(featureSelector, (state: DeficienciesSettingState) => state.config);

export const deficiencyTemplate = createSelector(selectFeature, (state: DeficienciesTemplateDetailsState) => state.deficiencyTemplate);
export const deficiencySettingsSavedSuccessfully = createSelector(selectFeature, (state: DeficienciesTemplateDetailsState) => state.deficiencySettingsSavedSuccessfully);

export const canEdit = createSelector(selectFeature, (state: DeficienciesTemplateDetailsState) => state.canEdit);

export const updateData = createSelector(selectFeature, (state: DeficienciesTemplateDetailsState) => state.updateData);
export const updatedSettingItems = createSelector(selectFeature, (state: DeficienciesTemplateDetailsState) => state.updatedSettingItems);
