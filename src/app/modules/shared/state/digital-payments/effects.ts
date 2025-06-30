import { Injectable } from '@angular/core';
import { IdValue } from '@app/models';
import { DigitalPaymentService } from '@app/services/api/digital-payments-service';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, mergeMap, switchMap } from 'rxjs/operators';
import * as digitalPaymentsActions from './actions';
import { ProjectsService } from '@app/services';

@Injectable()
export class DigitalPaymentEffects {
  constructor(
    private readonly actions$: Actions,
    private digitalPaymentService: DigitalPaymentService,
    private projectsService: ProjectsService,
  ) { }

  getDigitalProviderStatuses$ = createEffect(() => this.actions$.pipe(
    ofType(digitalPaymentsActions.GetDigitalProviderStatusesRequest),
    switchMap(() => this.digitalPaymentService.getDigitalProviderStatuses()
      .pipe(
        switchMap((response: IdValue[]) => [digitalPaymentsActions.GetDigitalProviderStatusesSuccess({ digitalProviderStatuses: response })]),
        catchError((error: string) => of(digitalPaymentsActions.Error({ error }))),
      )),
  ));

  exportDigitalPayRosterRequest$ = createEffect(() => this.actions$.pipe(
    ofType(digitalPaymentsActions.ExportDigitalPayRosterRequest),
    mergeMap(action => this.digitalPaymentService.exportDigitalPayRoster(action.exportRequest).pipe(
      switchMap((data: string) => [digitalPaymentsActions.ExportDigitalPayRosterSuccess({ channel: data })]),
      catchError((errorMessage: string) => of(digitalPaymentsActions.Error({ error: errorMessage }))),
    )),
  ));

  downloadDocument$ = createEffect(() => this.actions$.pipe(
    ofType(digitalPaymentsActions.DownloadDocument),
    mergeMap(action => this.projectsService.downloadDocument(action.id).pipe(
      switchMap(() => []),
      catchError((errorMessage: string) => of(digitalPaymentsActions.Error({ error: errorMessage }))),
    )),
  ));
}
