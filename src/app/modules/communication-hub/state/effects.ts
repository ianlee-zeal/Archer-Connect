import { Injectable } from "@angular/core";
import { CommunicationHubService } from "@app/services/api/communication-hub.service";
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, mergeMap, of, switchMap, tap } from "rxjs";
import * as communicationHubActions from './actions';
import { CommunicationHubState } from "./reducer";
import { ListMessagesResponse } from '@app/models/jira/jira-page';
import { JiraComment } from "@app/models/jira/jira-comment";
import { JiraRequestTypeField } from '@app/models/jira/jira-request-type-field';
import { JiraUser } from '@app/models/jira/jira-user';
import { ProjectsService, ToastService } from '@app/services';
import { JiraIssue } from "@app/models/jira/jira-issue";
import { JiraProjectListResponse } from '@app/models/jira/jira-project-list-response';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { filter, map } from 'rxjs/operators';

@Injectable()
export class CommunicationHubEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly store: Store<CommunicationHubState>,
    private communicationHubService: CommunicationHubService,
    private projectService: ProjectsService,
    private toaster: ToastService,
  ) {}

  loadMessages$ = createEffect(() => this.actions$.pipe(
    ofType(communicationHubActions.LoadMessages),
    mergeMap(action => this.communicationHubService.getMessages(action.jiraSearchOptions)
      .pipe(
        switchMap((response: ListMessagesResponse) => [
          communicationHubActions.LoadMessagesSuccess({page: response}),
        ]),
        catchError(error => of(communicationHubActions.Error({ errorMessage: error }))),
      )),
  ));

  loadMessage$ = createEffect(() => this.actions$.pipe(
    ofType(communicationHubActions.LoadMessage),
    mergeMap(action => this.communicationHubService.getMessage(action.ticketKey)
      .pipe(
        switchMap((response: JiraIssue) => [
          communicationHubActions.LoadMessageSuccess({issue: response}),
        ]),
        catchError(error => of(communicationHubActions.Error({ errorMessage: error }))),
      )),
  ));

  loadStatuses$ = createEffect(() => this.actions$.pipe(
    ofType(communicationHubActions.LoadStatuses),
    mergeMap(() => this.communicationHubService.getStatuses()
      .pipe(
        switchMap((response: any) => [
          communicationHubActions.LoadStatusesSuccess({statuses: response}),
        ]),
        catchError(error => of(communicationHubActions.Error({ errorMessage: error }))),
      )),
  ));

  loadRequestTypes$ = createEffect(() => this.actions$.pipe(
    ofType(communicationHubActions.LoadRequestTypes),
    mergeMap(() => this.communicationHubService.getRequestTypes()
      .pipe(
        switchMap((response: any) => [
          communicationHubActions.LoadRequestTypesSuccess({requestTypes: response}),
        ]),
        catchError(error => of(communicationHubActions.Error({ errorMessage: error }))),
      )),
  ));

  loadMessageComments$ = createEffect(() => this.actions$.pipe(
    ofType(communicationHubActions.LoadMessageComments),
    mergeMap(action => this.communicationHubService.getMessageComments(action.ticketKey)
      .pipe(
        switchMap((response: JiraComment[]) => [
          communicationHubActions.LoadMessageCommentsSuccess({comments: response}),
        ]),
        catchError(error => of(communicationHubActions.Error({ errorMessage: error }))),
      )),
  ));


  downloadAttachment$ = createEffect(() => this.actions$.pipe(
    ofType(communicationHubActions.DownloadAttachment),
    mergeMap(action => this.communicationHubService.downloadAttachment(action.attachmentId)
      .pipe(
        switchMap(() => [communicationHubActions.DownloadAttachmentSuccess()]),
        catchError(error => of(communicationHubActions.Error({ errorMessage: error }))),
      )),
  ));

  getJiraRequestTypeFields$ = createEffect(() => this.actions$.pipe(
    ofType(communicationHubActions.GetJiraRequestTypeFields),
    mergeMap(action => this.communicationHubService.getJiraRequestTypeFields(action.requestTypeId)
      .pipe(
        switchMap((response: JiraRequestTypeField[]) => [communicationHubActions.GetJiraRequestTypeFieldsSuccess({fields: response})]),
        catchError(error => of(communicationHubActions.Error({ errorMessage: error }))),
      )),
  ));

  createJiraMessage = createEffect(() => this.actions$.pipe(
    ofType(communicationHubActions.CreateJiraMessage),
    mergeMap(action => this.communicationHubService.postFormData(action.data)
      .pipe(
        switchMap(() => [communicationHubActions.CreateJiraMessageSuccess()]),
        catchError(error => [communicationHubActions.Error({ errorMessage: error })]),
      )),
  ));

  createJiraMessageSuccess$ = createEffect(() => this.actions$.pipe(
      ofType(communicationHubActions.CreateJiraMessageSuccess),
    tap(() => this.toaster.showSuccessMessage('Message sent')),
  ), { dispatch: false });

  getParticipants$ = createEffect(() => this.actions$.pipe(
    ofType(communicationHubActions.GetParticipants),
    mergeMap(action => this.communicationHubService.getParticipants(action.searchTerm)
      .pipe(
        switchMap((response: JiraUser[]) => [communicationHubActions.GetParticipantsSuccess({participants: response})]),
        catchError(error => of(communicationHubActions.Error({ errorMessage: error }))),
      )),
  ));

  getAgents$ = createEffect(() => this.actions$.pipe(
    ofType(communicationHubActions.GetAgents),
    mergeMap(() => this.communicationHubService.getProjectAgents()
      .pipe(
        switchMap((response: JiraUser[]) => [communicationHubActions.GetAgentsSuccess({agents: response})]),
        catchError(error => of(communicationHubActions.Error({ errorMessage: error }))),
      )),
  ));


  createJiraReply = createEffect(() => this.actions$.pipe(
    ofType(communicationHubActions.CreateJiraReply),
    mergeMap(action => this.communicationHubService.createJiraReply(action.data)
      .pipe(
        switchMap(() => [communicationHubActions.CreateJiraReplySuccess()]),
        catchError(error => [communicationHubActions.Error({ errorMessage: error })]),
      )),
  ));

  createJiraReplySuccess$ = createEffect(() => this.actions$.pipe(
    ofType(communicationHubActions.CreateJiraReplySuccess),
    tap(() => this.toaster.showSuccessMessage('Message sent')),
  ), { dispatch: false });

  getProjects$ = createEffect(() => this.actions$.pipe(
    ofType(communicationHubActions.GetProjectsRequest),
    mergeMap(action => this.projectService.search(action.search)
      .pipe(
        switchMap(response => {
          const projects = response.items.map(item => ({ id: item.id, displayName: `${item.id} - ${item.name}`, name: item.name }));
          return [communicationHubActions.GetProjectsSuccess({ projects })];
        }),
        catchError(error => of(communicationHubActions.GetProjectsError({ error }))),
      )),
  ));

  getUnresolvedCount$ = createEffect(() => this.actions$.pipe(
    ofType(communicationHubActions.GetUnresolvedCount),
    mergeMap(action => this.communicationHubService.getUnresolvedCount(action.userId)
      .pipe(
        switchMap((response: number) => [
          communicationHubActions.GetUnresolvedCountSuccess({unresolvedCount: response}),
        ]),
        catchError(error => of(communicationHubActions.Error({ errorMessage: error }))),
      )),
  ));

  getResponseNeededCount$ = createEffect(() => this.actions$.pipe(
    ofType(communicationHubActions.GetResponseNeededCount),
    mergeMap(action => this.communicationHubService.getResponseNeededCount(action.userId)
      .pipe(
        switchMap((response: number) => [
          communicationHubActions.GetResponseNeededCountSuccess({responseNeededCount: response}),
        ]),
        catchError(error => of(communicationHubActions.Error({ errorMessage: error }))),
      )),
  ));

  getAvailableJiraProjects$ = createEffect(() => this.actions$.pipe(
    ofType(communicationHubActions.GetAvailableJiraProjects),
    mergeMap(action => this.communicationHubService.getAvailableJiraProjects(action.jiraSearchOptions)
      .pipe(
        switchMap((response: JiraProjectListResponse) => [communicationHubActions.GetAvailableJiraProjectsSuccess({projects: response})]),
        catchError(error => of(communicationHubActions.Error({ errorMessage: error }))),
      )),
  ));

  uploadJiraFile$ = createEffect(() => this.actions$.pipe(
    ofType(communicationHubActions.UploadJiraFile),
    mergeMap(action => this.communicationHubService.uploadJiraFile(action.file)
      .pipe(
        map((event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress) {
            const progress = event.total ? Math.round(100 * event.loaded / event.total) : 0;
            return communicationHubActions.UploadJiraFileProgress({ progress });
          }
          if (event.type === HttpEventType.Response) {
            return communicationHubActions.UploadJiraFileSuccess({ resultId: event.body });
          }
          return null;
        }),
        filter(action => !!action),
        catchError(error => of(communicationHubActions.UploadJiraFileError({ errorMessage: error }))),
      ))
  ));
}
