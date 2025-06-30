/* eslint-disable @typescript-eslint/no-use-before-define */
import { Injectable } from '@angular/core';
import { of, forkJoin, Observable } from 'rxjs';
import { mergeMap, map, catchError, switchMap, tap, withLatestFrom, concatMap } from 'rxjs/operators';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { Router } from '@angular/router';
import { EntityTypeEnum } from '@app/models/enums';
import { Store } from '@ngrx/store';
import { ClientElectionService } from '@app/services/api/client-election.service';
import { StatusService } from '@app/services/api/status.service';
import { MaintenanceService } from '@app/services/api/maintenance.service';
import * as services from '../services';
import * as rootActions from './root.actions';

import { ProjectsService, EntityStatusesService, ToastService, OrgsService, BillingRuleService, QuickSearchService } from '../services';
import { EntityStatus } from '../models/entity-status';
import { IGridSettings, RootState } from './root.state';
import * as selectors from './index';

@Injectable()
export class RootEffects {
  constructor(
    private readonly appService: services.AppService,
    private readonly entityStatusesService: services.EntityStatusesService,
    private readonly actions$: Actions,
    private readonly toaster: ToastService,
    private readonly router: Router,
    private readonly projectsService: ProjectsService,
    private readonly entityStatusService: EntityStatusesService,
    private readonly store: Store<RootState>,
    private readonly clientElectionService: ClientElectionService,
    private readonly statusService: StatusService,
    private readonly orgService: OrgsService,
    private readonly billingRuleService: BillingRuleService,
    private readonly quickSearchService: QuickSearchService,
    private readonly maintenanceService: MaintenanceService,
  ) { }

  loadData$ = createEffect(() => this.actions$.pipe(
    ofType(rootActions.LoadData),
    mergeMap(() => forkJoin(
      this.appService.getDropdownValues(),
      // this.appService.getAdminUsers(),
      // this.appService.getFolders(),
    ).pipe(
      switchMap(data => [
        rootActions.LoadDataComplete({ data }),
      ]),
      catchError(e => of(rootActions.Error({ error: e }))),
    )),
  ));

  // Errors

  error$ = createEffect(() => this.actions$.pipe(
    ofType(
      rootActions.Error,
    ),
    map(({ error, title }) => [this.toaster.showError(error, title)]),
  ), { dispatch: false });

  loadEntityStatuses$ = createEffect(() => this.actions$.pipe(
    ofType(rootActions.GetEntityStatuses),
    mergeMap(action => this.entityStatusesService.getList(action.entityTypeId).pipe(
      switchMap(response => [
        rootActions.GetEntityStatusesComplete({ statuses: response.map(item => EntityStatus.toModel(item)) }),
      ]),
      catchError(e => of(rootActions.Error({ error: e }))),
    )),
  ));

  navigateToUrl$ = createEffect(() => this.actions$.pipe(
    ofType(rootActions.NavigateToUrl),
    tap(action => {
      this.router
        .navigateByUrl('/', { skipLocationChange: true })
        .then(() => this.router.navigate([action.url]));
    }),
  ), { dispatch: false });

  getFromStorage$ = createEffect(() => this.actions$.pipe(
    ofType(rootActions.LoadFromStorage),
    mergeMap(action => of(localStorage.getItem(action.key))
      .pipe(
        map(data => rootActions.LoadFromStorageSuccess({ data: data ? JSON.parse(data) : null })),
        catchError(e => of(rootActions.Error({ error: e }))),
      )),
  ));

  saveToStorage$ = createEffect(() => this.actions$.pipe(
    ofType(rootActions.SaveToStorage),
    mergeMap(action => saveToStorage(action.key, action.data)
      .pipe(
        map(data => rootActions.SaveToStorageSuccess({ data })),
        catchError(e => of(rootActions.Error({ error: e }))),
      )),
  ));

  clearStorage$ = createEffect(() => this.actions$.pipe(
    ofType(rootActions.ClearStorage),
    tap(action => localStorage.setItem(action.key, null)),
  ), { dispatch: false });

  getGridSettings$ = createEffect(() => this.actions$.pipe(
    ofType(rootActions.GetGridSettings),
    mergeMap(action => of(localStorage.getItem(action.key))
      .pipe(
        map(data => rootActions.GetGridSettingsSuccess({ key: action.key, data: data ? JSON.parse(data) : null })),
        catchError(e => of(rootActions.Error({ error: e }))),
      )),
  ));

  setGridSettings$ = createEffect(() => this.actions$.pipe(
    ofType(rootActions.SetGridSettings),
    mergeMap(action => saveToStorage(action.key, action.gridSettings)
      .pipe(
        map((data: IGridSettings) => rootActions.SetGridSettingsSuccess({ key: action.key, data })),
        catchError(e => of(rootActions.Error({ error: e }))),
      )),
  ));

  getProjectTypes$ = createEffect(() => this.actions$.pipe(
    ofType(rootActions.GetProjectTypes),
    withLatestFrom(this.store.select(selectors.projectTypesDropdownValues)),
    mergeMap(([, typesFromStore]) => {
      if (typesFromStore && typesFromStore.length) {
        return [rootActions.GetDropdownOptionsSuccess({ key: 'projectTypesOptions', values: typesFromStore })];
      }

      return this.projectsService.getTypes().pipe(
        switchMap(types => ([rootActions.GetDropdownOptionsSuccess({ key: 'projectTypesOptions', values: types })])),
        catchError(error => of(rootActions.Error({ error }))),
      );
    }),
  ));

  getProjectStatuses$ = createEffect(() => this.actions$.pipe(
    ofType(rootActions.GetProjectStatuses),
    withLatestFrom(this.store.select(selectors.projectStatusDropdownValues)),
    mergeMap(([, statusesFromStore]) => {
      if (statusesFromStore && statusesFromStore.length) {
        return [rootActions.GetDropdownOptionsSuccess({ key: 'projectStatusesOptions', values: statusesFromStore })];
      }

      return this.entityStatusService.getList(EntityTypeEnum.Projects)
        .pipe(
          switchMap(statuses => ([rootActions.GetDropdownOptionsSuccess({ key: 'projectStatusesOptions', values: statuses })])),
          catchError(error => of(rootActions.Error({ error }))),
        );
    }),
  ));

  getElectionFormStatuses$ = createEffect(() => this.actions$.pipe(
    ofType(rootActions.GetElectionFormStatuses),
    withLatestFrom(this.store.select(selectors.electionFormStatusOptions)),
    switchMap(([, statusesFromStore]) => {
      if (statusesFromStore && statusesFromStore.length) {
        return [rootActions.GetDropdownOptionsSuccess({ key: 'electionFormStatusOptions', values: statusesFromStore })];
      }

      return this.clientElectionService.getElectionFormStatuses().pipe(
        map(statuses => rootActions.GetDropdownOptionsSuccess({ key: 'electionFormStatusOptions', values: statuses })),
        catchError(error => of(rootActions.Error({ error }))),
      );
    }),
  ));

  getStatuses$ = createEffect(() => this.actions$.pipe(
    ofType(rootActions.GetStatuses),
    withLatestFrom(this.store.select(selectors.statuses)),
    concatMap(([action, statusesFromStore]) => {
      if (statusesFromStore?.getValue(action.entityType)?.length) {
        return [rootActions.GetStatusesSuccess({
          entityType: action.entityType,
          statuses: statusesFromStore.getValue(action.entityType),
        })];
      }

      return this.statusService.getStatuses(action.entityType).pipe(
        map(statuses => rootActions.GetStatusesSuccess({ entityType: action.entityType, statuses })),
        catchError(error => of(rootActions.Error({ error }))),
      );
    }),
  ));

  getBatchPaymentsOptions$ = createEffect(() => this.actions$.pipe(
    ofType(rootActions.GetBatchPaymentOptions),
    withLatestFrom(this.store.select(selectors.batchPaymentsOptions)),
    switchMap(([, optionsFromStore]) => {
      if (optionsFromStore && optionsFromStore.length) {
        return [rootActions.GetDropdownOptionsSuccess({ key: 'batchPaymentsOptions', values: optionsFromStore })];
      }

      return this.orgService.getBatchPaymentOptions()
        .pipe(
          map(response => rootActions.GetDropdownOptionsSuccess({ key: 'batchPaymentsOptions', values: response })),
          catchError(error => of(rootActions.Error({ error }))),
        );
    }),
  ));

  getFrequencyOptions$ = createEffect(() => this.actions$.pipe(
    ofType(rootActions.GetFrequencyOptions),
    withLatestFrom(this.store.select(selectors.frequencyOptions)),
    switchMap(([, optionsFromStore]) => {
      if (optionsFromStore && optionsFromStore.length) {
        return [rootActions.GetDropdownOptionsSuccess({ key: 'frequencyOptions', values: optionsFromStore })];
      }

      return this.orgService.getFrequencyOptions()
        .pipe(
          map(response => rootActions.GetDropdownOptionsSuccess({ key: 'frequencyOptions', values: response })),
          catchError(error => of(rootActions.Error({ error }))),
        );
    }),
  ));

  getBillToOptions$ = createEffect(() => this.actions$.pipe(
    ofType(rootActions.GetBillToOptions),
    withLatestFrom(this.store.select(selectors.billToOptions)),
    switchMap(([, optionsFromStore]) => {
      if (optionsFromStore && optionsFromStore.length) {
        return [rootActions.GetDropdownOptionsSuccess({ key: 'billToOptions', values: optionsFromStore })];
      }

      return this.billingRuleService.getBillToOptions()
        .pipe(
          map(response => rootActions.GetDropdownOptionsSuccess({ key: 'billToOptions', values: response })),
          catchError(error => of(rootActions.Error({ error }))),
        );
    }),
  ));

  quickSearch = createEffect(() => this.actions$.pipe(
    ofType(rootActions.QuickSearch),
    mergeMap(({ query, page, perPage }) => this.quickSearchService.searchClients(query, page, perPage).pipe(
      switchMap(foundItems => [rootActions.QuickSearchSuccess({ foundItems })]),
      catchError(error => of(rootActions.Error({ error }))),
    )),
  ));

  getUserBanner$ = createEffect(() => this.actions$.pipe(
    ofType(rootActions.GetUserBanner),
    switchMap(() => this.maintenanceService.getUserBanner().pipe(
      mergeMap(response => {
        return [rootActions.GetUserBannerCompleted({ message: response })];
      }),
    )),
  ));
}

function saveToStorage(key: string, data: Object): Observable<Object> {
  localStorage.setItem(key, JSON.stringify(data));
  return of(data);
}
