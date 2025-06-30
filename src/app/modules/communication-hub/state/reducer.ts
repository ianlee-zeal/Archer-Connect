import { Action, createReducer, on } from "@ngrx/store";
import * as communicationHubActions from "./actions";
import { ListMessagesResponse } from "@app/models/jira/jira-page";
import { JiraStatus } from '@app/models/jira/jira-status';
import { JiraRequestType } from '@app/models/jira/jira-request-type';
import { JiraComment } from "@app/models/jira/jira-comment";
import { JiraRequestTypeField } from '@app/models/jira/jira-request-type-field';
import { SelectOption } from "@app/modules/shared/_abstractions/base-select";
import { JiraUser } from '@app/models/jira/jira-user';
import { JiraIssue } from "@app/models/jira/jira-issue";
import { JiraProjectListResponse } from '@app/models/jira/jira-project-list-response';

export interface CommunicationHubState {
    page: ListMessagesResponse;
    issue: JiraIssue;
    statuses: JiraStatus[];
    requestTypes: JiraRequestType[];
    comments: JiraComment[];
    requestTypeFields: JiraRequestTypeField[];
    availableJiraProjects: JiraProjectListResponse;
    availableJiraProjectsLoading: boolean;
    projectsList: SelectOption[];
    isLoading: boolean;
    agents: JiraUser[];
    participants: JiraUser[];
    unresolvedCount: number;
    responseNededCount: number;
}

const initialState: CommunicationHubState = {
    page: null,
    issue: null,
    statuses: null,
    requestTypes: null,
    comments: null,
    requestTypeFields: null,
    availableJiraProjects: null,
    availableJiraProjectsLoading: false,
    projectsList: [],
    isLoading: false,
    agents: null,
    participants: null,
    unresolvedCount: null,
    responseNededCount: null,
};

export const communicationHubReducer = createReducer(
    initialState,
    on(communicationHubActions.LoadMessagesSuccess, (state, { page }) => ({ ...state, page })),
    on(communicationHubActions.LoadMessageSuccess, (state, { issue }) => ({ ...state, issue })),
    on(communicationHubActions.LoadStatusesSuccess, (state, { statuses }) => ({ ...state, statuses })),
    on(communicationHubActions.LoadRequestTypesSuccess, (state, { requestTypes }) => ({ ...state, requestTypes })),
    on(communicationHubActions.Error, (state, { errorMessage }) => ({ ...state, error: errorMessage })),
    on(communicationHubActions.LoadMessageCommentsSuccess, (state, { comments }) => ({ ...state, comments })),
    on(communicationHubActions.GetJiraRequestTypeFieldsSuccess, (state, { fields }) => ({ ...state, requestTypeFields: fields })),
    on(communicationHubActions.GetProjectsRequest, state => ({ ...state, isLoading: true })),
    on(communicationHubActions.GetProjectsSuccess, (state, { projects }) => ({ ...state, projectsList: [...projects], isLoading: false })),
    on(communicationHubActions.GetProjectsError, state => ({ ...state, isLoading: false })),
    on(communicationHubActions.GetParticipantsSuccess, (state, { participants }) => ({ ...state, participants: participants })),
    on(communicationHubActions.GetAgentsSuccess, (state, { agents }) => ({ ...state, agents: agents })),
    on(communicationHubActions.ClearJiraRequestTypeFields, (state, {}) => ({ ...state, requestTypeFields: [] })),
    on(communicationHubActions.GetUnresolvedCountSuccess, (state, { unresolvedCount }) => ({ ...state, unresolvedCount })),
    on(communicationHubActions.GetResponseNeededCountSuccess, (state, { responseNeededCount }) => ({ ...state, responseNededCount: responseNeededCount })),
    on(communicationHubActions.GetAvailableJiraProjects, state => ({ ...state, availableJiraProjectsLoading: true })),
    on(communicationHubActions.GetAvailableJiraProjectsSuccess, (state, { projects }) => ({ ...state, availableJiraProjects: projects, availableJiraProjectsLoading: false })),
);

// we have to wrap our reducer like this or it won't compile in prod
export function CommunicationHubReducer(state: CommunicationHubState | undefined, action: Action) {
    return communicationHubReducer(state, action);
}
