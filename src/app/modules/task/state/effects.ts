import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { EMPTY, forkJoin, of } from 'rxjs';
import {
  mergeMap,
  switchMap,
  catchError,
  tap,
} from 'rxjs/operators';

import { TaskRequest } from '@app/models/task-request';
import { Router } from '@angular/router';
import { TasksService } from '@app/services/api/tasks.service';
import { TeamsService } from '@app/services/api/teams.service';
import { WidgetService } from '@app/services/api/widget.service';
import { TeamToUser } from '@app/models';
import { Document } from '@app/models/documents';
import { DocumentsService } from '@app/services/api/documents/documents.service';
import { SearchOptionsHelper } from '@app/helpers/search-options.helper';
import { EntityTypeEnum } from '@app/models/enums/entity-type.enum';
import { Store } from '@ngrx/store';
import { TaskHelperService } from '@app/services/task/task.service';
import * as actions from './actions';
import { TaskState } from './reducer';

@Injectable()
export class TasksEffects {
  constructor(
    private readonly tasksService: TasksService,
    private readonly teamsService: TeamsService,
    private readonly widgetService: WidgetService,
    private readonly documentsService: DocumentsService,
    private readonly taskHelper: TaskHelperService,
    private readonly actions$: Actions,
    private readonly router: Router,
    private store: Store<TaskState>,
  ) { }

  getTasksList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetTasksList),
    mergeMap(action => this.tasksService.search(action.agGridParams.request)
      .pipe(
        switchMap(response => [
          actions.GetTasksListComplete({
            tasks: response.items,
            agGridParams: action.agGridParams,
            totalRecords: response.totalRecordsCount,
          })]),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));

  getTasksListComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetTasksListComplete),
    tap(action => { action.agGridParams.success({ rowData: action.tasks, rowCount: action.totalRecords}); }),
  ), { dispatch: false });

  createTask$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateTask),
    mergeMap(action => this.tasksService.post(action.taskDetails)
      .pipe(
        switchMap(response => {
          if (action.documents) {
            return [
              actions.SaveTaskDocuments({
                taskId: response.id,
                documents: action.documents,
                successAction: actions.CreateTaskComplete,
                successParams: { taskDetails: TaskRequest.toModel(response) },
                onTaskDocumentsSaved: () => {
                  this.router.navigate(['tasks', 'task-management', `${response?.id}`]);
                },
              }),
            ];
          }
          this.router.navigate(['tasks', 'task-management', `${response?.id}`]);
          return [
            actions.CreateTaskComplete({ taskDetails: TaskRequest.toModel(response) })];
        }),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));

  updateTask$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateTask),
    mergeMap(action => this.tasksService.updateTask(action.taskDetails)
      .pipe(
        switchMap(response => {
          if (action.documents) {
            return [
              actions.SaveTaskDocuments({
                taskId: response.id,
                documents: action.documents,
                successAction: actions.UpdateTaskComplete,
                successParams: { taskDetails: TaskRequest.toModel(response) },
                onTaskDocumentsSaved: () => {},
              }),
            ];
          }
          return [actions.UpdateTaskComplete({ taskDetails: TaskRequest.toModel(response) })];
        }),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));

  saveTaskDocuments$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SaveTaskDocuments),
    mergeMap(action => forkJoin(this.taskHelper.getSaveDocumentsList(action)).pipe(
      switchMap(() => {
        const count = (action.documents?.toAdd?.length || 0)
          - (action.documents?.toDelete?.length || 0);
        action.onTaskDocumentsSaved();
        return [
          actions.SaveTaskDocumentsComplete(),
          actions.UpdateTaskDocumentsCount({ count }),
          action.successAction(action.successParams),
        ];
      }),
      catchError(error => of(actions.Error({ errorMessage: error }))),
    )),
  ));

  getTaskDetails$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetTaskDetails),
    mergeMap(action => this.tasksService.get(action.taskId)
      .pipe(
        switchMap(response => [actions.GetTaskDetailsComplete({ taskDetails: TaskRequest.toModel(response) })]),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));

  getUserTeams$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetUserTeams),
    mergeMap(() => this.teamsService.getManagedTeamsByCurrentUserForTasks().pipe(
      switchMap(teams => [actions.GetUserTeamsComplete({ teams: teams.map(TeamToUser.toModel) })]),
      catchError(error => of(actions.Error({ errorMessage: error }))),
    )),
  ));

  getTeamMembers$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetTeamUsers),
    mergeMap(action => this.teamsService.getTeamMembersForTasks(action.teamId).pipe(
      switchMap(members => [actions.GetTeamUsersComplete({ members })]),
      catchError(error => of(actions.Error({ errorMessage: error }))),
    )),
  ));

  getTaskWidgets$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetTaskWidgets),
    mergeMap(action => this.widgetService.getTaskWidgets(action.taskWidgetRequest).pipe(
      switchMap(currentWidgetsData => [actions.GetTaskWidgetsComplete({ currentWidgetsData })]),
      catchError(error => of(actions.Error({ errorMessage: error }))),
    )),
  ));

  documentsByTaskId$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.GetDocumentsByTaskId),
    mergeMap(action => this.documentsService.index(
      {
        entityId: action.taskId,
        entityTypeId: EntityTypeEnum.Tasks,
        searchTerm: null,
        forOneEntityOnly: true,
        searchOptions: {
          ...SearchOptionsHelper.getFilterRequest([]),
          endRow: -1,
        },
      },
    )
      .pipe(
        switchMap(response => {
          const documents = response.items.map(item => Document.toModel(item));
          return [
            actions.GetDocumentsByTaskIdSuccess({ attachedDocuments: documents }),
          ];
        }),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));

  allDocumentsByTaskId$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.GetAllDocumentsByTaskId),
    mergeMap(action => this.documentsService.index(
      {
        entityId: action.taskId,
        entityTypeId: EntityTypeEnum.Tasks,
        searchTerm: null,
        searchOptions: {
          ...SearchOptionsHelper.getFilterRequest([]),
          endRow: -1,
        },
      },
    )
      .pipe(
        switchMap(response => {
          const documents: Document[] = response.items.map(item => Document.toModel(item));
          const taskDocuments = documents.filter(d => d.documentLinks[0].entityId == action.taskId);
          return [
            actions.GetDocumentsByTaskIdSuccess({ attachedDocuments: taskDocuments }),
            actions.GetAllDocumentsByTaskIdSuccess({ allTaskDocuments: documents }),
            actions.SetTaskDocumentsCount({ count: documents?.length || 0 }),
          ];
        }),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));

  export$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ExportTasks),
    mergeMap(action => this.tasksService.export(action.exportRequest)
      .pipe(switchMap(() => EMPTY),
        catchError(error => of(actions.Error({ errorMessage: error }))))),
  ));
}
