import { createSelector, createFeatureSelector } from '@ngrx/store';
import { DeficiencySettingsTemplate } from '@app/models/deficiencies/deficiency-settings-template';
import { DeficienciesSettingState } from '../../state/reducers';
import { FEATURE_NAME } from '../../state';
import { DeficiencySettingsTemplatesState } from './reducers';

const featureSelector = createFeatureSelector<DeficienciesSettingState>(FEATURE_NAME);
const selectFeature = createSelector(featureSelector, (state: DeficienciesSettingState) => state.templates);

export const gridParams = createSelector(selectFeature, (state: DeficiencySettingsTemplatesState) => state.gridParams);
export const templates = createSelector(selectFeature, (state: DeficiencySettingsTemplatesState) => state.templates);
export const isOnlySystemDefaultExist = createSelector(
  selectFeature,
  (state: DeficiencySettingsTemplatesState) => state.templates?.length === 1 && state.templates?.every((i: DeficiencySettingsTemplate) => i.isSystemDefault),
);
export const systemDefaultTemplate = createSelector(selectFeature, (state: DeficiencySettingsTemplatesState) => state.templates?.find((i: DeficiencySettingsTemplate) => i.isSystemDefault));
