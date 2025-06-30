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
import { LienDeficienciesService, ToastService } from '@app/services';
import { IntegrationDto } from '@app/models/lien-deficiencies/integrationDto';
import { IntegrationJob } from '@app/models/lien-deficiencies/integration-job';
import * as actions from './actions';

@Injectable()
export class LienDeficienciesGridEffects {
  constructor(
    private readonly lienDeficienciesService: LienDeficienciesService,
    private toaster: ToastService,
    private readonly actions$: Actions,
  ) { }

  getLienDeficiencyList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetList),
    mergeMap(action => this.lienDeficienciesService.search(action.agGridParams.request)
      .pipe(
        switchMap(response => [
          actions.GetListComplete({
            lienDeficiencyItems: response.items.map(IntegrationJob.toModel),
            agGridParams: action.agGridParams,
            totalRecords: response.totalRecordsCount,
          })]),
        catchError(error => of(actions.GetListError({
          errorMessage: error,
          agGridParams: action.agGridParams,
        }))),
      )),
  ));

  getLienDeficiencyListComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetListComplete),
    tap(action => {
      action.agGridParams.success({ rowData: action.lienDeficiencyItems, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  integrationRunCreate$ = createEffect(() => this.actions$.pipe(
    ofType(actions.StartRun),
    mergeMap(action => this.lienDeficienciesService.create(action.integrationDto)
      .pipe(
        switchMap(response => [
          actions.StartRunSuccess({ integrationDto: IntegrationDto.toModel(response) }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  downloadDocuments$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadDocument),
    mergeMap(action => this.lienDeficienciesService.downloadDocument(action.jobId).pipe(
      switchMap(() => []),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  error$ = createEffect(() => this.actions$.pipe(
    ofType(actions.Error),
    filter(action => isString(action.error)),
    tap(data => {
      this.toaster.showError(data.error);
    }),
  ), { dispatch: false });
}
