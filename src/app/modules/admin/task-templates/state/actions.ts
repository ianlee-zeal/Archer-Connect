import { TaskTemplate } from '@app/models/task-templates/task-template';
import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

export const featureName = '[Task Templates]';

export const Error = createAction(`${featureName} Error`, props<{ error: any }>());

export const GetTemplateDetails = createAction(`${featureName} Get Template Details`, props<{ taskId: number }>());
export const GetTemplateDetailsComplete = createAction(`${featureName} Get Template Details Complete`, props<{ templateDetails: TaskTemplate }>());

export const CreateTemplate = createAction(`${featureName} Create Template`, props<{ templateDetails: Partial<TaskTemplate> }>());
export const CreateTemplateComplete = createAction(`${featureName} Create Template Complete`, props<{ templateDetails: TaskTemplate }>());

export const UpdateTemplate = createAction(`${featureName} Update Template`, props<{ templateDetails: TaskTemplate }>());
export const UpdateTemplateComplete = createAction(`${featureName} Update Template Complete`, props<{ templateDetails: TaskTemplate }>());

export const GetTaskTemplatesList = createAction(`${featureName} Get Task Templates List`, props<{ gridParams: IServerSideGetRowsParamsExtended }>());
export const GetTaskTemplatesListSuccess = createAction(`${featureName} Get Task Templates List Success`);
