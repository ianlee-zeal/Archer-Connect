import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { createEffect, ofType, Actions } from '@ngrx/effects';
import { EMPTY, of } from 'rxjs';
import { mergeMap, switchMap, catchError, tap, map } from 'rxjs/operators';

import * as services from '@app/services';
import { Settlement } from '@app/models';
import * as rootActions from '@app/state/root.actions';
import * as actions from './actions';

@Injectable()
export class SettlementInfoEffects {
  constructor(
    private router: Router,
    private actions$: Actions,
    private settlementsService: services.SettlementsService,
    private toaster: services.ToastService,
  ) { }

  // Details

  getSettlementInfo$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetSettlementInfo),
    switchMap(action => {
      if (!action.id) {
        return EMPTY;
      }

      return this.settlementsService.get(action.id).pipe(
        mergeMap(response => [
          actions.GetSettlementInfoComplete({ settlement: Settlement.toModel(response) }),
          rootActions.LoadingFinished({ actionName: actions.GetSettlementInfo.type }),
        ]),
        catchError(error => of(actions.SettlementInfoError({ error }))),
      );
    }),
  ));

  // Save

  updateSettlementInfo$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SaveUpdatedSettlement),
    mergeMap(action => this.settlementsService.updateSettlement(Settlement.toDto(action.settlement)).pipe(
      switchMap(response => {
        action.callback();

        return [actions.SaveUpdatedSettlementComplete({ updatedSettlement: Settlement.toModel(response) })];
      }),
      catchError(error => of(actions.SettlementInfoError({ error }))),
    )),
  ));


  saveSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SaveUpdatedSettlementComplete),
    tap(() => this.toaster.showSuccess('Settlement was updated')),
  ), { dispatch: false });


  deleteSettlement$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.DeleteSettlement),
    mergeMap(action => this.settlementsService.delete(action.settlementId).pipe(
      switchMap(() => {
        action.callback();

        return [
          actions.GoToSettlements(),
          actions.DeleteSettlementComplete(),
        ];
      }),
      catchError(error => of(actions.SettlementInfoError({ error }))),
    )),
  ));


  deleteSettlementComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DeleteSettlementComplete),
    tap(() => this.toaster.showSuccess('Settlement was deleted')),
  ), { dispatch: false });


  goToSettlements$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GoToSettlements),
    tap(() => this.router.navigate(['settlements'], { state: { restoreSearch: true } })),
  ), { dispatch: false });


  getSettlementStart$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetSettlementLoadingStarted),
    map(() => rootActions.LoadingStarted({
      actionNames: [
        actions.GetSettlementInfo.type,
      ],
    })),
  ));
}
