import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mergeMap, switchMap, catchError } from 'rxjs/operators';

import * as services from '@app/services';
import { TaskTemplate } from '@app/models/task-templates/task-template';
import { MessageService, TasksService, ToastService } from '@app/services';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import * as actions from './actions';

@Injectable()
export class TaskTemplatesEffects {
  constructor(
    private actions$: Actions,
    private store: Store<any>,
    private taskTemplatesService: services.TaskTemplatesService,
    private messageService: MessageService,
    private toaster: ToastService,
    private readonly tasksService: TasksService,
    protected readonly router: Router,
  ) { }

  getTaskTemplatesList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetTaskTemplatesList),
    mergeMap(action => this.taskTemplatesService.search(action.gridParams.request)
      .pipe(
        switchMap(response => {
          action.gridParams.success({ rowData: response.items.map(TaskTemplate.toModel), rowCount: response.totalRecordsCount });
          return [actions.GetTaskTemplatesListSuccess()];
        }),
        catchError(error => [actions.Error({ error })]),
      )),
  ));

  getTaskDetails$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetTemplateDetails),
    mergeMap(action => this.taskTemplatesService.get(action.taskId)
      .pipe(
        switchMap(response => [actions.GetTemplateDetailsComplete({ templateDetails: TaskTemplate.toModel(response) })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  createTemplate$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateTemplate),
    mergeMap(action => this.taskTemplatesService.post(action.templateDetails)
      .pipe(
        switchMap(response => {
          this.router.navigate(['admin', 'task-templates', `${response?.id}`]);
          return [actions.CreateTemplateComplete({ templateDetails: TaskTemplate.toModel(response) })];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  updateTemplate$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateTemplate),
    mergeMap(action => this.taskTemplatesService.updateTemplate(action.templateDetails)
      .pipe(
        switchMap(response => [actions.UpdateTemplateComplete({ templateDetails: TaskTemplate.toModel(response) })]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));
}
