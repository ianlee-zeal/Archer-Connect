import { Document } from '@app/models/documents';
import { TaskRequest } from '@app/models/task-request';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { TeamToUser, User, TaskWidgetRequest, TaskWidget } from '@app/models';
import { TaskDocumentsSaveRequest } from '@app/models/task/task-documents-save-request';
import { IExportRequest } from '@app/models/export-request';

export const FEATURE_NAME = '[Task]';

export const Error = createAction(`${FEATURE_NAME} API Error`, props<{ errorMessage: string }>());
export const UpdateActionBar = createAction(`${FEATURE_NAME} Update Action Bar`, props<{ actionBar: ActionHandlersMap }>());

export const GetTasksList = createAction(`${FEATURE_NAME} Get Tasks List`, props<{ agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetTasksListComplete = createAction(`${FEATURE_NAME} Get Task sList Complete`, props<{ tasks: TaskRequest[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());

export const CreateTask = createAction(`${FEATURE_NAME} Create Task`, props<{ taskDetails: Partial<TaskRequest>, documents?: TaskDocumentsSaveRequest }>());
export const CreateTaskComplete = createAction(`${FEATURE_NAME} Create Task Complete`, props<{ taskDetails: TaskRequest }>());

export const UpdateTask = createAction(`${FEATURE_NAME} Update Task`, props<{ taskDetails: TaskRequest, documents?: TaskDocumentsSaveRequest }>());
export const UpdateTaskComplete = createAction(`${FEATURE_NAME} Update Task Complete`, props<{ taskDetails: TaskRequest }>());

export const GetTaskDetails = createAction(`${FEATURE_NAME} Get Task Details`, props<{ taskId: number }>());
export const GetTaskDetailsComplete = createAction(`${FEATURE_NAME} Get Task Details Complete`, props<{ taskDetails: TaskRequest }>());

export const GetTemplateDetails = createAction(`${FEATURE_NAME} Get Template Details`, props<{ taskId: number }>());
export const GetTemplateDetailsComplete = createAction(`${FEATURE_NAME} Get Template Details Complete`, props<{ taskDetails: TaskRequest }>());

export const GetUserTeams = createAction(`${FEATURE_NAME} Get User Teams`);
export const GetUserTeamsComplete = createAction(`${FEATURE_NAME} Get User Teams Complete`, props<{ teams: TeamToUser[] }>());

export const GetTeamUsers = createAction(`${FEATURE_NAME} Get Team Members`, props<{ teamId?: number }>());
export const GetTeamUsersComplete = createAction(`${FEATURE_NAME} Get Team Members Complete`, props<{ members: User[] }>());

export const GetTaskWidgets = createAction(`${FEATURE_NAME} Get Task Widgets`, props<{ taskWidgetRequest: TaskWidgetRequest }>());
export const GetTaskWidgetsComplete = createAction(`${FEATURE_NAME} Get Task Widgets Complete`, props<{ currentWidgetsData: TaskWidget[] }>());

export const GetDocumentsByTaskId = createAction(`${FEATURE_NAME} Get Documents By Task Id`, props<{ taskId: number }>());
export const GetDocumentsByTaskIdSuccess = createAction(`${FEATURE_NAME} Get Documents By Task Id Success`, props<{ attachedDocuments: Document[] }>());

export const UpdateTaskDocumentsCount = createAction(`${FEATURE_NAME} Update Task Documents Count`, props<{ count: number }>());
export const SetTaskDocumentsCount = createAction(`${FEATURE_NAME} Set Task Documents Count`, props<{ count: number }>());

export const ExportTasks = createAction('[Tasks List] Export Tasks', props<{ exportRequest: IExportRequest }>());

export const SaveTaskDocuments = createAction(`${FEATURE_NAME} Save Task Documents`, props<{
  taskId: number,
  documents?: TaskDocumentsSaveRequest,
  successAction: any,
  successParams: any,
  onTaskDocumentsSaved: any,
}>());
export const SaveTaskDocumentsComplete = createAction(`${FEATURE_NAME} Save Task Documents Complete`);

export const GetAllDocumentsByTaskId = createAction(`${FEATURE_NAME} Get All Documents related to Task`, props<{ taskId: number }>());
export const GetAllDocumentsByTaskIdSuccess = createAction(`${FEATURE_NAME} Get All Documents related to Task Success`, props<{ allTaskDocuments: Document[] }>());
