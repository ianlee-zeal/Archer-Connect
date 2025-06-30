import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import {
  map,
  mergeMap,
  switchMap,
  catchError,
  withLatestFrom,
} from 'rxjs/operators';

import { LienFinalizationService } from '@app/services';
import { Store } from '@ngrx/store';

import { LienFinalizationState } from '@app/modules/lien-finalization/state/reducer';
import { lienFinalizationSelector } from '@app/modules/lien-finalization/state/selectors';
import { LienFinalizationRun } from '@app/models/lien-finalization/lien-finalization-run';
import * as actions from './actions';

@Injectable()
export class LienProcessingModalEffects {
  constructor(
    private readonly lienFinalizaitonService: LienFinalizationService,
    private readonly actions$: Actions,
    private readonly store$: Store<LienFinalizationState>,
  ) { }

  getDropdownValues$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDropdownValues),
    withLatestFrom(this.store$.select(lienFinalizationSelector.lienFinalization)),
    map(([, lienFinalization]) => lienFinalization),
    switchMap(lienFinalization => [actions.GetDropdownValuesSuccess({ collectors: lienFinalization.grid.collectorOptions })]),
  ));

  createLienFinalizaiton$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateLienFinalization),
    mergeMap(action => this.lienFinalizaitonService.createLienFinalization(action)
      .pipe(
        switchMap((lienFinalizationRun: LienFinalizationRun) => [
          actions.CreateLienFinalizationSuccess({ lienFinalizationRun }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  RunLienFinalization$ = createEffect(() => this.actions$.pipe(
    ofType(actions.RunLienFinalization),
    mergeMap(action => this.lienFinalizaitonService.runLienFinalization(action.batchId, action.lienFinalizationRunCreation)
      .pipe(
        switchMap((lienFinalizationRun: LienFinalizationRun) => [
          actions.RunLienFinalizationSuccess({ lienFinalizationRun }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  runAcceptance$ = createEffect(() => this.actions$.pipe(
    ofType(actions.RunAcceptance),
    mergeMap(action => this.lienFinalizaitonService.runAcceptance(action.batchId, action.lienFinalizationRunCreation)
      .pipe(
        switchMap((lienFinalizationRun: LienFinalizationRun) => [
          actions.RunAcceptanceSuccess({ lienFinalizationRun }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  RunReadyLiens$ = createEffect(() => this.actions$.pipe(
    ofType(actions.RunReadyLiens),
    mergeMap(action => this.lienFinalizaitonService.readyLienFinalizationRun(action.batchId, action.lienFinalizationRunCreation)
      .pipe(
        switchMap((lienFinalizationRun: LienFinalizationRun) => [
          actions.RunReadyLiensSuccess({ lienFinalizationRun }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));
}
