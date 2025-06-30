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

import { AuditorService, OrgsService, ToastService } from '@app/services';
import { AuditRun } from '@app/models/auditor/audit-run';
import { IdValue } from '@app/models';
import * as auditBatchesActions from './actions';

@Injectable()
export class AuditBatchesEffects {
  constructor(
    private readonly auditorService: AuditorService,
    private orgService: OrgsService,
    private toaster: ToastService,
    private readonly actions$: Actions,
  ) { }

  getCollectors$ = createEffect(() => this.actions$.pipe(
    ofType(auditBatchesActions.GetCollectors),
    mergeMap(action => this.orgService.collectorsByIds(action.searchOptions)
      .pipe(
        switchMap(response => [
          auditBatchesActions.GetCollectorsSuccess({ collectorOptions: response?.items.map(item => (new IdValue(item.id, item.name))) })]),
        catchError(err => of(auditBatchesActions.Error({ errorMessage: err.message }))),
      )),
  ));

  getAuditBatchesList$ = createEffect(() => this.actions$.pipe(
    ofType(auditBatchesActions.GetList),
    mergeMap(action => this.auditorService.search(action.agGridParams.request)
      .pipe(
        switchMap(response => [
          auditBatchesActions.GetListComplete({
            auditBatches: response.items.map(AuditRun.toModel),
            agGridParams: action.agGridParams,
            totalRecords: response.totalRecordsCount,
          })]),
        catchError(error => of(auditBatchesActions.GetListError({
          errorMessage: error,
          agGridParams: action.agGridParams,
        }))),
      )),
  ));

  getAuditBatchesListComplete$ = createEffect(() => this.actions$.pipe(
    ofType(auditBatchesActions.GetListComplete),
    tap(action => {
      action.agGridParams.success({ rowData: action.auditBatches, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  error$ = createEffect(() => this.actions$.pipe(
    ofType(auditBatchesActions.Error),
    filter(action => isString(action.errorMessage)),
    tap(data => {
      this.toaster.showError(data.errorMessage);
    }),
  ), { dispatch: false });
}
