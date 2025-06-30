import { TaskRequest } from '@app/models/task-request';
import { createReducer, on, Action } from '@ngrx/store';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { TeamToUser, User, TaskWidget } from '@app/models';
import { Document } from '@app/models/documents';
import * as actions from './actions';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

export interface TaskState {
  error: string,
  actionBar: ActionHandlersMap,
  agGridParams: IServerSideGetRowsRequestExtended;
  taskDetails: TaskRequest,
  currentUserTeams: TeamToUser[],
  currentTeamMembers: User[],
  currentWidgetsData: TaskWidget[],
  attachedDocuments: Document[],
  allTaskDocuments: Document[],
  attachedDocumentsCount?: number;
}

const taskInitialState: TaskState = {
  error: null,
  actionBar: null,
  agGridParams: null,
  taskDetails: null,
  currentUserTeams: [],
  currentTeamMembers: [],
  currentWidgetsData: [],
  attachedDocuments: [],
  allTaskDocuments: [],
};

const taskReducer = createReducer(
  taskInitialState,
  on(actions.Error, (state, { errorMessage }) => ({ ...state, errorMessage })),
  on(actions.UpdateActionBar, (state, { actionBar }) => ({ ...state, actionBar })),

  on(actions.GetTasksListComplete, (state, { agGridParams }) => ({ ...state, agGridParams: agGridParams.request, error: null })),
  on(actions.CreateTaskComplete, (state, { taskDetails }) => ({ ...state, taskDetails })),
  on(actions.UpdateTaskComplete, (state, { taskDetails }) => ({ ...state, taskDetails })),
  on(actions.GetTaskDetailsComplete, (state, { taskDetails }) => ({ ...state, taskDetails })),
  on(actions.GetUserTeamsComplete, (state, { teams }) => ({ ...state, currentUserTeams: teams, pending: false })),
  on(actions.GetTeamUsersComplete, (state, { members }) => ({ ...state, currentTeamMembers: members, pending: false })),
  on(actions.GetTaskWidgetsComplete, (state, { currentWidgetsData }) => ({ ...state, currentWidgetsData, pending: false })),

  on(actions.GetDocumentsByTaskIdSuccess, (state, { attachedDocuments }) => ({ ...state, attachedDocuments })),
  on(actions.GetAllDocumentsByTaskIdSuccess, (state, { allTaskDocuments }) => ({ ...state, allTaskDocuments })),

  on(actions.UpdateTaskDocumentsCount, (state, { count }) => ({
    ...state,
    attachedDocumentsCount: state.attachedDocumentsCount + count,
  })),
  on(actions.SetTaskDocumentsCount, (state, { count }) => ({
    ...state,
    attachedDocumentsCount: count,
  })),
);

// we have to wrap our reducer like this or it won't compile in prod
export function TaskReducer(state: TaskState | undefined, action: Action) {
  return taskReducer(state, action);
}
