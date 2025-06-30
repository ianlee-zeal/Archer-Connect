import { createAction, props } from '@ngrx/store';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { DeficiencySettingsTemplate } from '@app/models/deficiencies/deficiency-settings-template';

const featureName = '[Disbursment-Groups-Base]';
export const Error = createAction(`${featureName} Error Message`, props<{ error: String }>());

export const GetDisbursementGroupTypes = createAction(`${featureName} Get Disbursement Group Types`);
export const GetDisbursementGroupTypesSuccess = createAction(`${featureName} Get Disbursement Group Types Success`, props<{ types: SelectOption[] }>());
export const ResetDisbursementGroupTypes = createAction(`${featureName} Reset Disbursement Group Types`);

export const GetDisbursementGroupStages = createAction(`${featureName} Get Disbursement Group Stages`);
export const GetDisbursementGroupStagesSuccess = createAction(`${featureName} Get Disbursement Group Stages Success`, props<{ stages: SelectOption[] }>());
export const ResetDisbursementGroupStages = createAction(`${featureName} Reset Disbursement Group Stages`);

export const GetDeficiencySettingsTemplates = createAction(`${featureName} Get Deficiency Settings Templates`);
export const GetDeficiencySettingsTemplatesSuccess = createAction(`${featureName} Get Deficiency Settings Templates Success`, props<{ templates: DeficiencySettingsTemplate[] }>());
export const ResetDeficiencySettingsTemplates = createAction(`${featureName} Reset Deficiency Settings Templates`);
