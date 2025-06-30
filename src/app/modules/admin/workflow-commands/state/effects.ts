import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mergeMap, switchMap, catchError, tap } from 'rxjs/operators';

import { Router } from '@angular/router';
import { of } from 'rxjs';
import { WorkflowCommandsService } from '@app/services/api/workflow-commands.service';
import { WorkflowCommand } from '@app/models/workflow-command';
import { AGResponse } from '@app/models';
import { ToastService } from '@app/services/toast-service';
import * as actions from './actions';

@Injectable()
export class WorkflowCommandsEffects {
  constructor(
    private actions$: Actions,
    private workflowCommandsService: WorkflowCommandsService,
    protected readonly router: Router,
    private toaster: ToastService,
  ) { }

  getWorkflowCommandsList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetWorkflowCommandsList),
    mergeMap(action => this.workflowCommandsService.search(action.gridParams.request)
      .pipe(
        switchMap((response: AGResponse<WorkflowCommand>) => {
          action.gridParams.success({ rowData: response.items.map(WorkflowCommand.toModel), rowCount: response.totalRecordsCount });
          return [actions.GetWorkflowCommandsListComplete()];
        }),
        catchError((error: string) => [actions.Error({ error })]),
      )),
  ));

  getWorkflowCommand$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetWorkflowCommandDetails),
    mergeMap(action => this.workflowCommandsService.get(action.taskId)
      .pipe(
        switchMap((response: WorkflowCommand) => [actions.GetWorkflowCommandDetailsComplete({ workflowCommandDetails: response })]),
        catchError((error: string) => of(actions.Error({ error }))),
      )),
  ));

  updateWorkflowCommand$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateWorkflowCommand),
    mergeMap(action => this.workflowCommandsService.updateWorkflowCommand(action.workflowCommandDetails)
      .pipe(
        switchMap((response: WorkflowCommand) => {
          const workflowCommandDetails = WorkflowCommand.toModel(response as WorkflowCommand);

          const updatedItemId: number = response?.id ? response.id : action.workflowCommandDetails.id;
          this.router.navigate(['admin', 'workflow-commands', `${updatedItemId}`]);

          return [actions.UpdateWorkflowCommandComplete({ workflowCommandDetails: WorkflowCommand.toModel(workflowCommandDetails) })];
        }),
        catchError((error: string) => of(actions.Error({ error }))),
      )),
  ));

  updateWorkflowCommandComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UpdateWorkflowCommandComplete),
    tap(() => {
      this.toaster.showSuccess('Workflow Command was updated');
    }),
  ), { dispatch: false });

  getWorkflowCommandsFilters$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetWorkflowCommandsFilters),
    mergeMap(action => this.workflowCommandsService.getWorkflowCommandsFilters(action.filterType)
      .pipe(
        switchMap((response: string[]) => [actions.GetWorkflowCommandsFiltersComplete({ filterType: action.filterType,
          options: response.map((item: string, index: number) => (
            { id: index, name: item })) })]),
        catchError((error: string) => of(actions.Error({ error }))),
      )),
  ));

  deleteWorkflowCommand$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.DeleteWorkflowCommand),
    mergeMap(action => this.workflowCommandsService.delete(action.id).pipe(
      switchMap(() => [actions.DeleteWorkflowCommandComplete(), actions.GotoWorkflowCommands()]),
      catchError((error: string) => of(actions.Error({ error }))),
    )),
  ));

  deleteWorkflowCommandComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DeleteWorkflowCommandComplete),
    tap(() => {
      this.toaster.showSuccess('Workflow Command was deleted');
    }),
  ), { dispatch: false });

  gotoWorkflowCommands$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GotoWorkflowCommands),
    tap(() => this.router.navigate(['admin/workflow-commands'])),
  ), { dispatch: false });
}
