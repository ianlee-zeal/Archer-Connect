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

import { AuditorService, ToastService } from '@app/services';
import { AuditRunDetails } from '@app/models/auditor/audit-run-details';
import { AuditRun } from '@app/models/auditor/audit-run';
import * as actions from './actions';

@Injectable()
export class AuditDetailsEffects {
  constructor(
    private readonly auditorService: AuditorService,
    private toaster: ToastService,
    private readonly actions$: Actions,
  ) { }

  getAuditDetailsLoadingStarted$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetAuditDetailsLoadingStarted),
    map(() => rootActions.LoadingStarted({
      actionNames: [
        actions.GetAuditClaimsList.type,
      ],
    })),
  ));

  getAuditDetails$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetAuditDetails),
    mergeMap(action => this.auditorService.search(action.searchOptions)
      .pipe(
        switchMap(response => [
          actions.GetAuditDetailsComplete({ item: response?.items?.length ? AuditRun.toModel(response.items[0]) : null })]),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));

  getList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetAuditClaimsList),
    mergeMap(action => this.auditorService.getAuditResults(action.agGridParams.request).pipe(
      switchMap(response => [
        actions.GetAuditClaimsListComplete({
          auditClaims: response.items.map(AuditRunDetails.toModel),
          agGridParams: action.agGridParams,
          totalRecords: response.totalRecordsCount,
        }),
        rootActions.LoadingFinished({ actionName: actions.GetAuditClaimsList.type })]),
      catchError(error => of(actions.GetAuditClaimsListError({
        errorMessage: error,
        agGridParams: action.agGridParams,
      }))),
    )),
  ));

  getListComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetAuditClaimsListComplete),
    tap(action => {
      action.agGridParams.success({ rowData: action.auditClaims, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  exportAuditDetails$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ExportAuditDetails),
    mergeMap(action => {
      return this.auditorService.export(action.id, action.channelName).pipe(
        switchMap(data => [actions.ExportAuditDetailsComplete({ channel: data })]),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      );
    }),
  ));

  error$ = createEffect(() => this.actions$.pipe(
    ofType(actions.Error),
    filter(action => isString(action.errorMessage)),
    tap(data => {
      this.toaster.showError(data.errorMessage);
    }),
  ), { dispatch: false });
}
