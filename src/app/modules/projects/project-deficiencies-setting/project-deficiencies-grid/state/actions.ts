import { DeficiencySettingsTemplate } from '@app/models/deficiencies/deficiency-settings-template';
import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { TemplateActionEnum } from '../../enums/template-actions.enum';

const featureName = '[Project Deficiencies Setting]';

export const Error = createAction(`${featureName} Error Message`, props<{ error: string }>());

export const GetDeficienciesTemplatesList = createAction(`${featureName} Get Deficiencies Templates List`, props<{ params: IServerSideGetRowsParamsExtended }>());
export const GetDeficienciesTemplatesListSuccess = createAction(`${featureName} Get Deficiencies Templates List Success`, props<{ templates: DeficiencySettingsTemplate[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());

export const GoToTemplateDetails = createAction(`${featureName} Go To Deficency Setting Template Details`, props<{ id: number, canEdit: boolean, action: TemplateActionEnum }>());

export const SetDefaultTemplate = createAction(`${featureName} Set Default Template`, props<{ templateId: number }>());
export const SetDefaultTemplateSuccess = createAction(`${featureName} Set Default Template Success`);

export const CreateTemplate = createAction(`${featureName} Create Template`);

export const RefreshDeficiencySettingsList = createAction(`${featureName} Refresh Deficiency Settings List`);
