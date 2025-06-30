import { IdValue } from '@app/models';
import { TaskManagementEntityEnum } from '@app/models/enums/task-management-entity.enum';
import { TaskRequest } from '@app/models/task-request';
import { TaskTemplate } from '@app/models/task-templates/task-template';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { createAction, props } from '@ngrx/store';
import { Document } from '@app/models/documents';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { TaskDocumentsSaveRequest } from '@app/models/task/task-documents-save-request';

export const FEATURE_NAME = '[TasksDetailsTemplate]';

export const Error = createAction(`${FEATURE_NAME} API Error`, props<{ errorMessage: string }>());

export const SaveSelectedTemplateId = createAction(`${FEATURE_NAME} Save Selected TemplateId`, props<{ templateId: number }>());

export const GetArcherOrgId = createAction(`${FEATURE_NAME} Get Archer Org Id`);
export const GetArcherOrgIdSuccess = createAction(`${FEATURE_NAME}  Get Archer Org Id Success`, props<{ archerId: number }>());

export const GetSubTasksList = createAction(`${FEATURE_NAME} Get Sub Tasks List`, props<{ entityId: number, gridParams: IServerSideGetRowsParamsExtended }>());
export const GetSubTasksListSuccess = createAction(`${FEATURE_NAME} Get Sub Tasks List Success`, props<{ subTasks: TaskRequest[] }>());

export const GetSubTemplateList = createAction(`${FEATURE_NAME} Get Sub Template List`, props<{ entityId: number, gridParams: IServerSideGetRowsParamsExtended, existing: boolean }>());
export const GetSubTemplateListSuccess = createAction(`${FEATURE_NAME} Get Sub Template List Success`, props<{ subTemplates: TaskTemplate[] }>());

export const GetTaskCategories = createAction(`${FEATURE_NAME} Get Task Categories`);
export const GetTaskCategoriesComplete = createAction(`${FEATURE_NAME} Get Task Categories Complete`, props<{ taskCategories: SelectOption[] }>());

export const ClearSubEntitiesGrids = createAction(`${FEATURE_NAME} Clear Sub Entities Grids`);

export const GetSubTaskCategories = createAction(`${FEATURE_NAME} Get Sub-Task Categories`, props<{ parentCategory: IdValue }>());
export const GetSubTaskCategoriesComplete = createAction(`${FEATURE_NAME} Get Sub-Task Categories Complete`, props<{ subTaskCategories: SelectOption[] }>());

export const GetPriorities = createAction(`${FEATURE_NAME} Get Priorities`);
export const GetPrioritiesComplete = createAction(`${FEATURE_NAME} Get Priorities Complete`, props<{ priorities: SelectOption[] }>());

export const GetStages = createAction(`${FEATURE_NAME} Get Stages`);
export const GetStagesComplete = createAction(`${FEATURE_NAME} Get Stages Complete`, props<{ stages: SelectOption[] }>());

export const GetTeams = createAction(`${FEATURE_NAME} Get Teams`);
export const GetTeamsComplete = createAction(`${FEATURE_NAME} Get Teams Complete`, props<{ teams: SelectOption[] }>());

export const GetTemplates = createAction(`${FEATURE_NAME} Get Templates`);
export const GetTemplatesComplete = createAction(`${FEATURE_NAME} Get Templates Complete`, props<{ templates: TaskTemplate[] }>());

export const CreateSubTask = createAction(`${FEATURE_NAME} Create Sub-Task`, props<{ taskDetails: Partial<TaskRequest>, taskManagementEntity: TaskManagementEntityEnum, documents?: TaskDocumentsSaveRequest, }>());
export const CreateSubTaskComplete = createAction(`${FEATURE_NAME} Create Sub-Task Complete`);

export const UpdateSubTask = createAction(`${FEATURE_NAME} Update Sub-Task`, props<{ taskDetails: TaskRequest | TaskTemplate, taskManagementEntity: TaskManagementEntityEnum, documents?: TaskDocumentsSaveRequest, }>());
export const UpdateSubTaskComplete = createAction(`${FEATURE_NAME} Update Sub-Task Complete`);

export const GetSubTask = createAction(`${FEATURE_NAME} Get Sub-Task`, props<{ taskId: number }>());
export const GetSubTaskComplete = createAction(`${FEATURE_NAME} Get Sub-Task Complete`, props<{ taskDetails: TaskRequest }>());

export const GetSubTemplate = createAction(`${FEATURE_NAME} Get Sub-Template`, props<{ templateId: number }>());
export const GetSubTemplateComplete = createAction(`${FEATURE_NAME} Get Sub-Template Complete`, props<{ taskDetails: TaskTemplate }>());

export const ClearSubTaskForm = createAction(`${FEATURE_NAME} Clear Sub-Task Form`);

export const GetDocumentsBySubTaskId = createAction(`${FEATURE_NAME} Get Documents By Sub-Task Id`, props<{ subTaskId: number }>());
export const GetDocumentsBySubTaskIdSuccess = createAction(`${FEATURE_NAME} Get Documents By Sub-Task Id Success`, props<{ attachedDocuments: Document[] }>());

export const SaveTaskDocuments = createAction(`${FEATURE_NAME} Save Task or Sub-Task Documents`, props<{
  taskId: number,
  documents?: TaskDocumentsSaveRequest,
  onTaskDocumentsSaved
}>());
export const SaveTaskDocumentsComplete = createAction(`${FEATURE_NAME} Save Task or Sub-Task Documents Complete`);
