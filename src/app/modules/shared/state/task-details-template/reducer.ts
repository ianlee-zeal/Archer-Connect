import { TaskRequest } from '@app/models/task-request';
import { TaskTemplate } from '@app/models/task-templates/task-template';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { createReducer, on, Action } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { Document } from '@app/models/documents';
import * as actions from './actions';

export interface TasksDetailsTemplateState {
  error: string,
  subTasksGridParams: IServerSideGetRowsParamsExtended,
  subTemplatesGridParams: IServerSideGetRowsParamsExtended,
  archerId: number,
  taskCategories: SelectOption [],
  subTaskCategories: SelectOption [],
  priorities: SelectOption [],
  stages: SelectOption [],
  teams: SelectOption [],
  templates: TaskTemplate [],
  subTasks: TaskRequest [],
  subTemplates: TaskTemplate[],
  templateId: number,
  subTaskDetails: TaskRequest,
  subTemplateDetails: TaskTemplate,
  attachedDocuments: Document[],
  attachedDocsInProgress: boolean,
}

const tasksDetailsTemplateState: TasksDetailsTemplateState = {
  error: null,
  subTasksGridParams: null,
  subTemplatesGridParams: null,
  archerId: null,
  taskCategories: null,
  subTaskCategories: null,
  priorities: null,
  stages: null,
  teams: null,
  templates: null,
  subTemplates: null,
  subTasks: null,
  templateId: null,
  subTaskDetails: null,
  subTemplateDetails: null,
  attachedDocuments: [],
  attachedDocsInProgress: false,
};

const tasksDetailsTemplateReducer = createReducer(
  tasksDetailsTemplateState,
  on(actions.Error, (state, { errorMessage }) => ({ ...state, errorMessage })),
  on(actions.SaveSelectedTemplateId, (state, { templateId }) => ({ ...state, templateId })),
  on(actions.GetSubTasksList, (state, { gridParams }) => ({ ...state, error: null, subTasksGridParams: gridParams })),
  on(actions.GetSubTasksListSuccess, (state, { subTasks }) => ({ ...state, subTasks })),
  on(actions.GetSubTemplateList, (state, { gridParams }) => ({ ...state, subTemplatesGridParams: gridParams })),
  on(actions.GetSubTemplateListSuccess, (state, { subTemplates }) => ({ ...state, subTemplates })),
  on(actions.ClearSubEntitiesGrids, state => ({ ...state, subTasks: [], subTemplates: [] })),
  on(actions.GetTaskCategoriesComplete, (state, { taskCategories }) => ({ ...state, taskCategories })),
  on(actions.GetSubTaskCategoriesComplete, (state, { subTaskCategories }) => ({ ...state, subTaskCategories })),
  on(actions.GetPrioritiesComplete, (state, { priorities }) => ({ ...state, priorities })),
  on(actions.GetStagesComplete, (state, { stages }) => ({ ...state, stages })),
  on(actions.GetTeamsComplete, (state, { teams }) => ({ ...state, teams })),
  on(actions.GetTemplatesComplete, (state, { templates }) => ({ ...state, templates })),

  on(actions.GetSubTaskComplete, (state, { taskDetails }) => ({ ...state, subTaskDetails: taskDetails })),
  on(actions.GetSubTemplateComplete, (state, { taskDetails }) => ({ ...state, subTemplateDetails: taskDetails })),
  on(actions.ClearSubTaskForm, state => ({ ...state, subTaskDetails: null, subTemplateDetails: null, attachedDocuments: [] })),

  on(actions.GetDocumentsBySubTaskId, state => ({ ...state, attachedDocsInProgress: true })),
  on(actions.GetDocumentsBySubTaskIdSuccess, (state, { attachedDocuments }) => ({ ...state, attachedDocuments, attachedDocsInProgress: false })),
);

// we have to wrap our reducer like this or it won't compile in prod
export function TasksDetailsTemplateReducer(state: TasksDetailsTemplateState | undefined, action: Action) {
  return tasksDetailsTemplateReducer(state, action);
}
