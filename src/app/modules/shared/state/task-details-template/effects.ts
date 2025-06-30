import { TaskRequest } from '@app/models/task-request';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { forkJoin, of } from 'rxjs';
import {
  mergeMap,
  switchMap,
  catchError,
} from 'rxjs/operators';

import { Document } from '@app/models/documents';
import { DocumentsService, OrgsService, TaskTemplatesService, TeamsService } from '@app/services';
import { SearchOptionsHelper } from '@app/helpers';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import { Org } from '@app/models';
import { TasksService } from '@app/services/api/tasks.service';
import { TaskTemplate } from '@app/models/task-templates/task-template';
import { TaskManagementEntityEnum } from '@app/models/enums/task-management-entity.enum';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state';
import { EntityTypeEnum } from '@app/models/enums';
import { TaskHelperService } from '@app/services/task/task.service';
import * as taskActions from '@app/modules/task/state/actions';
import * as actions from './actions';

@Injectable()
export class TasksDetailsTemplateEffects {
  constructor(
    private readonly tasksService: TasksService,
    private readonly taskTemplatesService: TaskTemplatesService,
    private readonly teamsService: TeamsService,
    private readonly actions$: Actions,
    private readonly documentsService: DocumentsService,
    private store: Store<AppState>,
    private readonly taskHelper: TaskHelperService,
    private orgsService: OrgsService,
  ) { }

  getArcherOrgId$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetArcherOrgId),
    mergeMap(() => this.orgsService.index({
      searchOptions: {
        ...SearchOptionsHelper.getFilterRequest([
          SearchOptionsHelper.getBooleanFilter('isMaster', FilterTypes.Boolean, 'equals', true),
        ]),
      },
    })
      .pipe(
        switchMap(({ items }) => {
          const archerId: number = items.find((item: Org) => item.isMaster)?.id;
          return [actions.GetArcherOrgIdSuccess({ archerId })];
        }),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));

  getSubTasksList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetSubTasksList),
    mergeMap(action => this.tasksService.search(
      {
        ...action.gridParams.request,
        filterModel: [
          ...action.gridParams.request.filterModel,
          SearchOptionsHelper.getNumberFilter('parentId', 'number', 'equals', action.entityId),
        ],
      },
    )
      .pipe(
        switchMap(response => {
          const subTasks = response.items.map(TaskRequest.toModel);

          return [actions.GetSubTasksListSuccess({ subTasks })];
        }),
        catchError(error => [actions.Error({ errorMessage: error })]),
      )),
  ));

  getSubTemplateList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetSubTemplateList),
    mergeMap(action => this.taskTemplatesService.search(
      {
        ...action.gridParams.request,
        filterModel: [
          ...action.gridParams.request.filterModel,
          SearchOptionsHelper.getNumberFilter('parentId', 'number', 'equals', action.entityId),
        ],
      },
    )
      .pipe(
        switchMap(response => {
          const subTemplates: TaskTemplate[] = response.items.map(TaskTemplate.toModel);
          if (!action.existing) {
            subTemplates.forEach(st => st.notExisting = true );
          }
          return [actions.GetSubTemplateListSuccess({ subTemplates })];
        }),
        catchError(error => [actions.Error({ errorMessage: error })]),
      )),
  ));

  getTaskCategories$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetTaskCategories),
    mergeMap(() => this.tasksService.getTaskCategories()
      .pipe(
        switchMap((taskCategories: SelectOption []) => [actions.GetTaskCategoriesComplete({ taskCategories })]),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));

  getSubTaskCategories$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetSubTaskCategories),
    mergeMap(action => this.tasksService.getSubTaskCategories(action?.parentCategory.id)
      .pipe(
        switchMap((categories: SelectOption []) => {
          const subTaskCategories = categories.length > 0 ? categories : [action.parentCategory];
          return [actions.GetSubTaskCategoriesComplete({ subTaskCategories })];
        }),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));

  getPriorities$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPriorities),
    mergeMap(() => this.tasksService.getPriorities()
      .pipe(
        switchMap((priorities: SelectOption []) => [actions.GetPrioritiesComplete({ priorities })]),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));

  getStages$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetStages),
    mergeMap(() => this.tasksService.getStages()
      .pipe(
        switchMap((stages: SelectOption []) => [actions.GetStagesComplete({ stages })]),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));

  getTeams$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetTeams),
    mergeMap(() => this.teamsService.getTeams()
      .pipe(
        switchMap((teams: SelectOption []) => [actions.GetTeamsComplete({ teams })]),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));

  getTemplates$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetTemplates),
    mergeMap(() => this.taskTemplatesService.search({ ...SearchOptionsHelper.getFilterRequest([SearchOptionsHelper.getBooleanFilter('active', FilterTypes.Boolean, 'equals', true)]), startRow: 0, endRow: -1 })
      .pipe(
        switchMap(({ items }) => [actions.GetTemplatesComplete({ templates: items.map(TaskTemplate.toModel) })]),
        catchError(error => [actions.Error({ errorMessage: error })]),
      )),
  ));

  createSubTask$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateSubTask),
    mergeMap(action => ((action.taskManagementEntity === TaskManagementEntityEnum.Task
      ? this.tasksService.post(action.taskDetails) : this.taskTemplatesService.post(action.taskDetails)))
      .pipe(
        switchMap(response => {
          if (action.taskManagementEntity === TaskManagementEntityEnum.Task && !!action.documents) {
            return [
              actions.SaveTaskDocuments({
                taskId: response.id,
                documents: action.documents,
                onTaskDocumentsSaved: actions.CreateSubTaskComplete,
              }),
            ];
          }
          return [
            actions.CreateSubTaskComplete(),
          ];
        }),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));

  updateTask$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateSubTask),
    mergeMap(action => ((action.taskManagementEntity === TaskManagementEntityEnum.Task
      ? this.tasksService.updateTask(action.taskDetails as TaskRequest)
      : this.taskTemplatesService.updateTemplate(action.taskDetails as TaskTemplate)))
      .pipe(
        switchMap(() => {
          if (action.taskManagementEntity === TaskManagementEntityEnum.Task && !!action.documents) {
            return [
              actions.SaveTaskDocuments({
                taskId: action.taskDetails.id,
                documents: action.documents,
                onTaskDocumentsSaved: actions.UpdateSubTaskComplete,
              }),
            ];
          }
          return [
            actions.UpdateSubTaskComplete(),
          ];
        }),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));

  getSubTaskDetails$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetSubTask),
    mergeMap(action => this.tasksService.get(action.taskId)
      .pipe(
        switchMap(response => [actions.GetSubTaskComplete({ taskDetails: TaskRequest.toModel(response) })]),
        catchError(errorMessage => of(actions.Error({ errorMessage }))),
      )),
  ));

  getSubTemplateDetails$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetSubTemplate),
    mergeMap(action => this.taskTemplatesService.get(action.templateId)
      .pipe(
        switchMap(response => [actions.GetSubTemplateComplete({ taskDetails: TaskTemplate.toModel(response) })]),
        catchError(errorMessage => of(actions.Error({ errorMessage }))),
      )),
  ));

  documentsByTaskId$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.GetDocumentsBySubTaskId),
    mergeMap(action => this.documentsService.index(
      {
        entityId: action.subTaskId,
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
          const documents = response.items.map(item => Document.toModel(item));
          return [
            actions.GetDocumentsBySubTaskIdSuccess({ attachedDocuments: documents }),
          ];
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
        return [
          taskActions.UpdateTaskDocumentsCount({ count }),
          actions.SaveTaskDocumentsComplete(),
          action.onTaskDocumentsSaved(),
        ];
      }),
      catchError(error => of(actions.Error({ errorMessage: error }))),
    )),
  ));
}
