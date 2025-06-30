import { ClientElectionService } from '@app/services/api/client-election.service';
import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { mergeMap, switchMap, catchError, tap } from 'rxjs/operators';
import { ChangeHistory } from '@app/models/change-history';
import { ToastService } from '@app/services';
import * as actions from './actions';

@Injectable()
export class ChangeHistoryListEffects {
  constructor(
    private readonly clientElectionService: ClientElectionService,
    private readonly toaster: ToastService,
    private readonly actions$: Actions,
  ) { }

  readonly getChangeHistoryList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetChangeHistoryList),
    mergeMap(action => this.clientElectionService.getElectionFormChangelog(action.electionFormId)
      .pipe(
        switchMap(historyList => {
          const changeHistory = historyList.map(item => ChangeHistory.toModel(item))
            .filter(item => Number(item.oldValue) !== Number(item.newValue))
            .sort((a, b) => b.date - a.date);

          return [
            actions.GetChangeHistoryListComplete({ changeHistory, agGridParams: action.agGridParams, totalRecords: changeHistory.length }),

          ];
        }),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));

  readonly getProbateChangeHistoryList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProbateChangeHistoryList),
    mergeMap(action => this.clientElectionService.getProbateChangelog(action.probateId, action.agGridParams.request).pipe(
      switchMap(result => {
        const changeHistory: ChangeHistory[] = result.items?.map(item => ChangeHistory.toModel(item));
        return [
          actions.GetProbateChangeHistoryListComplete({
            changeHistory,
            agGridParams: action.agGridParams,
            totalRecords: result.totalRecordsCount,
          }),
        ];
      }),
      catchError(error => of(actions.Error({ errorMessage: error }))),
    )),
  ));

  readonly getChangeHistoryListComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetChangeHistoryListComplete, actions.GetProbateChangeHistoryListComplete),
    tap(action => {
      action.agGridParams.success({ rowData: action.changeHistory, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  readonly error$ = createEffect(() => this.actions$.pipe(
    ofType(actions.Error),
    tap(action => this.toaster.showError(action.errorMessage)),
  ), { dispatch: false });
}
