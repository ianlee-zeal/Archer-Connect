import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mergeMap, switchMap, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import * as services from '@app/services';
import { LienStatusSummary } from '@app/models';
import * as actions from './actions';
import { TotalPaymentChartData } from '@app/models/liens/total-payment-chart-data';
import { QsfAdminPhaseSummary } from '@app/models/liens/qsf-admin-phase-summary';

@Injectable()
export class QsfAdminDashboardEffects {
  constructor(
    private projectsService: services.ProjectsService,
    private readonly toasterService: services.ToastService,
    private actions$: Actions,
  ) { }

  getStatusesSummary$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.GetStatusesSummary),
    mergeMap(action => this.projectsService.getProductStatusesSummary(
      action.rootProductCategoryId,
      action.projectId,
      [],
      action.lienPhases,
      null,
      action.bypassSpinner,
    ).pipe(
      switchMap(response => [actions.GetStatusesSummarySuccess({ summary: new LienStatusSummary(response) })]),
      catchError(error => of(actions.Error({ errorMessage: error }))),
    )),
  ));

  getPhasesSummary$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.GetPhasesSummary),
    mergeMap(action => this.projectsService.getClientsByAttorneyPmtStatusSummary(
      action.projectId,
      action.lienPhases,
      action.clientStatuses,
      action.bypassSpinner,
    ).pipe(
      switchMap(response => [actions.GetPhasesSummarySuccess({ summary: new QsfAdminPhaseSummary(response) })]),
      catchError(error => of(actions.Error({ errorMessage: error }))),
    )),
  ));

  getTotalPaymentChartData$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.GetTotalPaymentChartData),
    mergeMap(action => this.projectsService.getTotalPaymentChartData(action.projectId, action.bypassSpinner )
      .pipe(
        switchMap(response => [actions.GetTotalPaymentChartDataSuccess({ summary: new TotalPaymentChartData(response) })]),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));

  error$ = createEffect(() => this.actions$.pipe(
    ofType(actions.Error),
    tap(data => {
      this.toasterService.showError(data.errorMessage);
    }),
  ), { dispatch: false });
}
