import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { mergeMap, switchMap, catchError, tap } from 'rxjs/operators';
import { ToastService, ClientsService } from '@app/services';
import { LedgerChangeHistory } from '@app/models/ledger-change-history';
import * as actions from './actions';

@Injectable()
export class StageHistoryListEffects {
  constructor(
    private clientsService: ClientsService,
    private toaster: ToastService,
    private actions$: Actions,
  ) { }


  getStageHistoryList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetStageHistoryList),
    mergeMap(action => this.clientsService.getLedgerStageChangeHistory(action.id).pipe(
      switchMap(historyList => {
        const changeHistory = historyList.map(item => LedgerChangeHistory.toModel(item));

        return [
          actions.GetStageHistoryListComplete({ changeHistory, agGridParams: action.agGridParams, totalRecords: changeHistory.length }),
        ];
      }),
      catchError(error => of(actions.Error({ errorMessage: error }))),
    )),
  ));


  getStageHistoryListComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetStageHistoryListComplete),
    tap(action => {
      action.agGridParams.success({ rowData: action.changeHistory, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });


  error$ = createEffect(() => this.actions$.pipe(
    ofType(actions.Error),
    tap(action => this.toaster.showError(action.errorMessage)),
  ), { dispatch: false });
}
