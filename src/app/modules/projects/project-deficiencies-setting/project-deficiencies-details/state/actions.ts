import { DeficiencySettingsConfig } from '@app/models/deficiencies/deficiency-settings-config';
import { DeficiencySettingsTemplate } from '@app/models/deficiencies/deficiency-settings-template';
import { IDeficiencySettingsTemplateUpdate } from '@app/models/deficiencies/deficiency-settings-template-update';
import { createAction, props } from '@ngrx/store';

const featureName = '[Project Deficiencies Setting]';

export const Error = createAction(`${featureName} Error Message`, props<{ error: string }>());

export const GetDeficiencySettingsTemplate = createAction(`${featureName} Get Deficiency Settings Tempate`, props<{ templateId: number }>());
export const GetDeficiencySettingsTemplateSuccess = createAction(`${featureName} Get Deficiency Settings Template Success`, props<{ template: DeficiencySettingsTemplate }>());

export const SaveDeficiencySettings = createAction(`${featureName} Save Deficiency Settings`, props<{ templateId: number }>());
export const SaveDeficiencySettingsSuccess = createAction(`${featureName} Save Deficiency Settings Success`, props<{ templateId: number }>());

export const SetEditFlag = createAction(`${featureName} Set Edit Flag`, props<{ canEdit: boolean }>());

export const SetUpdatedSettingItems = createAction(`${featureName} Set Updated Setting Items`, props<{ settingId: number, setting: DeficiencySettingsConfig }>());
export const ClearUpdatedSettingItems = createAction(`${featureName} Clear Updated Setting Items`);

export const UpdateTemplateData = createAction(`${featureName} Update Template Data`, props<{ data: IDeficiencySettingsTemplateUpdate }>());

export const ResetTemplateData = createAction(`${featureName} Reset Template Data`);
