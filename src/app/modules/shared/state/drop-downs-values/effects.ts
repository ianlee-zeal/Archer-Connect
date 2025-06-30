import { Injectable } from '@angular/core';
import { of, EMPTY } from 'rxjs';
import { createEffect, ofType, Actions } from '@ngrx/effects';
import { switchMap, catchError, map, mergeMap } from 'rxjs/operators';
import { TimeZoneService } from '@app/services/time-zone.servise';
import { DefaultGlobalSearchTypeService } from '@app/services/default-gobal-search-type.service';
import { TimeZone } from '@app/models/time-zone';
import { PaymentQueueService } from '@app/services/api/payment-queue.service';
import { ChartOfAccountsService, LienFinalizationService, StagesService } from '@app/services';
import { EntityTypeEnum } from '@app/models/enums';
import { StatusService } from '@app/services/api/status.service';
import * as actions from './actions';

@Injectable()
export class DropDownsValuesEffects {
  constructor(
    private actions$: Actions,
    private timeZoneService: TimeZoneService,
    private defaultGlobalSearchTypeService: DefaultGlobalSearchTypeService,
    private paymentQueueService: PaymentQueueService,
    private stageService: StagesService,
    private statusService: StatusService,
    private finalizationService: LienFinalizationService,
    private readonly chartOfAccountsService: ChartOfAccountsService,
  ) {}

  getTimeZoneList$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.GetTimeZoneListRequest),
    switchMap(() => this.timeZoneService.index()
      .pipe(
        map(response => {
          if (response) {
            const timeZones = response.map(timezone => TimeZone.toModel(timezone));

            return actions.GetTimeZoneListRequestCompleted({ timeZones });
          }
          return EMPTY;
        }),
        catchError(() => of(actions.Error)),
      )),
  ));

  getDefaultGlobalSearchTypeList$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.GetDefaultGlobalSearchTypeListRequest),
    switchMap(() => this.defaultGlobalSearchTypeService.index()
      .pipe(
        map(response => {
          if (response) {
            return actions.GetDefaultGlobalSearchTypeListRequestCompleted({ defaultGlobalSearchTypes: response });
          }
          return EMPTY;
        }),
        catchError(() => of(actions.Error)),
      )),
  ));

  getLedgerAccounts$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.GetLedgerAccounts),
    mergeMap(action => this.paymentQueueService.getLedgerAccounts(action.projectId)
      .pipe(
        switchMap(response => [
          actions.GetLedgerAccountsComplete({ ledgerAccounts: response }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getLedgerAccountGroups$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.GetLedgerAccountGroups),
    mergeMap(action => this.paymentQueueService.getLedgerAccountGroups(action.projectId)
      .pipe(
        switchMap(response => [
          actions.GetLedgerAccountGroupsComplete({ ledgerAccountGroups: response }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getStages$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.GetStages),
    mergeMap(action => this.stageService.getByEntityTypeId((<EntityTypeEnum>action.entityTypeId))
      .pipe(
        switchMap(response => [
          actions.GetStagesComplete({ stages: response }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getStatuses$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.GetStatuses),
    mergeMap(action => this.statusService.getStatuses((<EntityTypeEnum>action.entityTypeId))
      .pipe(
        switchMap(response => [
          actions.GetStatusesComplete({ statuses: response }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getLienTypes$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetLienTypes),
    mergeMap(() => this.finalizationService.getLienTypes().pipe(
      switchMap(response => [
        actions.GetLienTypesComplete({
          lienTypes: response,
        })]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  getPlanTypes$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPlanTypes),
    mergeMap(() => this.finalizationService.getPlanTypes().pipe(
      switchMap(response => [
        actions.GetPlanTypesComplete({
          planTypes: response,
        })]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  getChartOfAccountGroupNumbers$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.GetChartOfAccountGroupNumbers),
    mergeMap(() => this.chartOfAccountsService.getChartOfAccountGroupNumbers()
      .pipe(
        switchMap(response => [
          actions.GetChartOfAccountGroupNumbersComplete({ coaGroupNumbers: response }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getChartOfAccountNumbers$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.GetChartOfAccountNumbers),
    mergeMap(() => this.chartOfAccountsService.getGetChartOfAccountNumbers()
      .pipe(
        switchMap(response => [
          actions.GetChartOfAccountNumbersComplete({ coaNumbers: response }),
        ]),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));
}
