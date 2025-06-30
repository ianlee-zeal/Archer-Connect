import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import {
  filter,
  map,
  mergeMap,
  switchMap,
  catchError,
  tap,
} from 'rxjs/operators';

import isString from 'lodash-es/isString';
import * as rootActions from '@app/state/root.actions';

import { LienFinalizationService, ToastService } from '@app/services';
import * as actions from './actions';
import { LienFinalizationDetail } from '@app/models/lien-finalization/lien-finalization-detail';
import { LienFinalizationRun } from '@app/models/lien-finalization/lien-finalization-run';

@Injectable()
export class FinalizationDetailsEffects {
  constructor(
    private readonly finalizationService: LienFinalizationService,
    private toaster: ToastService,
    private readonly actions$: Actions,
  ) { }

  getFinalizationDetailsLoadingStarted$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetFinalizationDetailsLoadingStarted),
    map(() => rootActions.LoadingStarted({
      actionNames: [
        actions.GetFinalizationDetailsGrid.type,
      ],
    })),
  ));

  getFinalizationDetails$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetFinalizationDetails),
    mergeMap(action => this.finalizationService.search(action.searchOptions)
      .pipe(
        switchMap(response => [
          actions.GetFinalizationDetailsComplete({ item: response?.items?.length ? LienFinalizationRun.toModel(response.items[0]) : null })]),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));

  getList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetFinalizationDetailsGrid),
    mergeMap(action => this.finalizationService.detailsGrid(action.agGridParams.request).pipe(
      switchMap(response => [
        actions.GetFinalizationDetailsGridComplete({
          finalizationDetails: response.items.map(LienFinalizationDetail.toModel),
          agGridParams: action.agGridParams,
          totalRecords: response.totalRecordsCount,
        }),
        rootActions.LoadingFinished({ actionName: actions.GetFinalizationDetailsGrid.type })]),
      catchError(error => of(actions.GetFinalizationDetailsGridError({
        errorMessage: error,
        agGridParams: action.agGridParams,
      }))),
    )),
  ));

  selectLien$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SelectLien),
    mergeMap(action => this.finalizationService.selectLien(action.id, action.status)
      .pipe(
        switchMap(() => [
          actions.SelectLienComplete()]),
        catchError(error => of(actions.Error({
          errorMessage: error,
        }))),
      )),
  ));

  acceptLien = createEffect(() => this.actions$.pipe(
    ofType(actions.AcceptLien),
    mergeMap(action => this.finalizationService.acceptLien(action.id, action.status)
      .pipe(
        switchMap(() => [
          actions.AcceptLienComplete()]),
        catchError(error => of(actions.Error({
          errorMessage: error,
        }))),
      )),
  ));

  getListComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetFinalizationDetailsGridComplete),
    tap(action => {
      action.agGridParams.success({ rowData: action.finalizationDetails, rowCount: action.totalRecords});
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
