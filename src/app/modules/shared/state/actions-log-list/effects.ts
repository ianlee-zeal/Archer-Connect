import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mergeMap, switchMap, catchError, tap } from 'rxjs/operators';
import { ActionLogRecord } from '@app/models/actionLogRecord';
import { of } from 'rxjs';
import * as actions from './actions';
import * as services from '../../../../services';

@Injectable()
export class ActionsLogListEffects {
  constructor(
    private actions$: Actions,
    private usersService: services.UsersService,
  ) { }

  getUserLogInHistory$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetActionsLogRequest),
    mergeMap(action => this.usersService.getActionsLog(action.userGuid, action.params.request)
      .pipe(
        switchMap(response => {
          const actionsLog = response.items.map(item => ActionLogRecord.toModel(item));

          return [actions.GetActionsLogRequestComplete({ actionsLog, agGridParams: action.params, totalRecords: response.totalRecordsCount }),
          ];
        }),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));

  getUserLogInHistoryComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetActionsLogRequestComplete),
    tap(action => {
      action.agGridParams.success({ rowData: action.actionsLog, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });
}
