import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import {
  filter,
  mergeMap,
  switchMap,
  catchError,
  tap,
} from 'rxjs/operators';

import isString from 'lodash-es/isString';
import { LienFinalizationService, OrgsService, ToastService } from '@app/services';
import { LienFinalizationRun } from '@app/models/lien-finalization/lien-finalization-run';
import * as actions from './actions';
import { LPMHelper } from '@app/helpers/lpm.helper';

@Injectable()
export class LienFinalizationGridEffects {
  constructor(
    private readonly lienFinalizationService: LienFinalizationService,
    private orgService: OrgsService,
    private toaster: ToastService,
    private readonly actions$: Actions,
  ) { }

  getCollectors$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetCollectors),
    mergeMap(action => this.orgService.getCollectorOrgsByCollectoIds(action.firmIds)
      .pipe(
        switchMap(response => [
          actions.GetCollectorsSuccess({ collectorOptions: response })]),
        catchError(err => of(actions.Error({ errorMessage: err.message }))),
      )),
  ));

  cancelRun$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CancelRun),
    mergeMap(action => this.lienFinalizationService.cancelRun(action.id)
      .pipe(
        switchMap(() => [
          actions.CancelRunSuccess()]),
        catchError(err => of(actions.Error({ errorMessage: err.message }))),
      )),
  ));

  submitRun$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CompleteRun),
    mergeMap(action => this.lienFinalizationService.completeRun(action.id)
      .pipe(
        switchMap(() => [
          actions.CompleteRunSuccess()]),
        catchError(err => of(actions.Error({ errorMessage: err.message }))),
      )),
  ));

  submitRunComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CompleteRunSuccess),
    tap(() => {
      LPMHelper.viewInLPM('/#upload-details');
    }),
  ), { dispatch: false });

  getLienFinalizationList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetList),
    mergeMap(action => this.lienFinalizationService.search(action.agGridParams.request)
      .pipe(
        switchMap(response => [
          actions.GetListComplete({
            lienFinalizationItems: response.items.map(LienFinalizationRun.toModel),
            agGridParams: action.agGridParams,
            totalRecords: response.totalRecordsCount,
          })]),
        catchError(error => of(actions.GetListError({
          errorMessage: error,
          agGridParams: action.agGridParams,
        }))),
      )),
  ));

  getLienFinalizationListComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetListComplete),
    tap(action => {
      action.agGridParams.success({ rowData: action.lienFinalizationItems, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  error$ = createEffect(() => this.actions$.pipe(
    ofType(actions.Error),
    filter(action => isString(action.errorMessage)),
    tap(data => {
      this.toaster.showError(data.errorMessage);
    }),
  ), { dispatch: false });
}
