import { DeficiencySettingsConfig } from '@app/models/deficiencies/deficiency-settings-config';
import { createReducer, Action, on } from '@ngrx/store';
import { DeficiencySettingsTemplate } from '@app/models/deficiencies/deficiency-settings-template';
import { Dictionary, IDictionary } from '@app/models/utils';
import { IDeficiencySettingsTemplateUpdate } from '@app/models/deficiencies/deficiency-settings-template-update';
import * as actions from './actions';

export interface DeficienciesTemplateDetailsState {
  updateData: IDeficiencySettingsTemplateUpdate;
  updatedSettingItems: IDictionary<number, DeficiencySettingsConfig>,
  deficiencyTemplate: DeficiencySettingsTemplate;
  deficiencySettingsSavedSuccessfully: boolean,
  error: string;
  canEdit: boolean;
}

export const deficienciesConfigState: DeficienciesTemplateDetailsState = {
  updateData: null,
  updatedSettingItems: new Dictionary<number, DeficiencySettingsConfig>(),
  deficiencyTemplate: null,
  deficiencySettingsSavedSuccessfully: null,
  error: null,
  canEdit: false,
};

function SetUpdatedSettingItems(state: DeficienciesTemplateDetailsState, settingId: number, setting: DeficiencySettingsConfig): IDictionary<number, DeficiencySettingsConfig> {
  const newUpdatedSettingItems = state.updatedSettingItems.clone();
  newUpdatedSettingItems.setValue(settingId, setting);
  return newUpdatedSettingItems;
}

const Reducer = createReducer(
  deficienciesConfigState,

  on(
    actions.GetDeficiencySettingsTemplateSuccess,
    (state: DeficienciesTemplateDetailsState, { template }: { template: DeficiencySettingsTemplate }) => ({ ...state, error: null, deficiencyTemplate: template, updateData: { ...state.updateData, id: template.id } }),
  ),
  on(actions.SaveDeficiencySettings, (state: DeficienciesTemplateDetailsState) => ({ ...state, deficiencySettingsSavedSuccessfully: false })),
  on(actions.SaveDeficiencySettingsSuccess, (state: DeficienciesTemplateDetailsState) => ({ ...state, deficiencySettingsSavedSuccessfully: true })),
  on(actions.SetEditFlag, (state: DeficienciesTemplateDetailsState, { canEdit }: { canEdit: boolean }) => ({ ...state, canEdit })),

  on(
    actions.SetUpdatedSettingItems,
    (state: DeficienciesTemplateDetailsState, { settingId, setting }: { settingId: number, setting: DeficiencySettingsConfig }) => ({ ...state, updatedSettingItems: SetUpdatedSettingItems(state, settingId, setting) }),
  ),
  on(actions.ClearUpdatedSettingItems, (state: DeficienciesTemplateDetailsState) => ({ ...state, updatedSettingItems: new Dictionary<number, DeficiencySettingsConfig>() })),
  on(actions.UpdateTemplateData, (state: DeficienciesTemplateDetailsState, { data }: { data: IDeficiencySettingsTemplateUpdate }) => ({ ...state, updateData: { ...state.updateData, ...data } })),

  on(actions.ResetTemplateData, (state: DeficienciesTemplateDetailsState) => ({ ...state, ...deficienciesConfigState })),

);

export function reducer(state: DeficienciesTemplateDetailsState | undefined, action: Action): DeficienciesTemplateDetailsState {
  return Reducer(state, action);
}
