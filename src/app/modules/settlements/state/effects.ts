import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import {
  mergeMap,
  switchMap,
  catchError,
  tap,
} from 'rxjs/operators';

import { SettlementsService, ToastService } from '@app/services';
import { Settlement, Project } from '@app/models';
import { Claimant } from '@app/models/claimant';

import { actions } from '.';

@Injectable()
export class SettlementsEffects {
  constructor(
    private readonly settlementsService: SettlementsService,
    private readonly actions$: Actions,
    private readonly router: Router,
    private readonly toaster: ToastService,
  ) { }


  getAGSettlementsListError$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetSettlementsListError),
    tap(action => {
      console.error(action.errorMessage); // eslint-disable-line no-console
      action.agGridParams.fail();
    }),
  ), { dispatch: false });


  getAGSettlementsList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetSettlementsList),
    mergeMap(action => this.settlementsService.search(action.agGridParams.request)
      .pipe(
        switchMap(response => [
          actions.GetSettlementsListComplete({
            settlements: response.items.map(Settlement.toModel),
            agGridParams: action.agGridParams,
            totalRecords: response.totalRecordsCount,
          })]),
        catchError(error => of(actions.GetSettlementsListError({
          errorMessage: error,
          agGridParams: action.agGridParams,
        }))),
      )),
  ));


  getAGSettlementsListComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetSettlementsListComplete),
    tap(action => {
      action.agGridParams.success({ rowData: action.settlements, rowCount: action.totalRecords });
    }),
  ), { dispatch: false });

  // Create

  createSettlement$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateSettlement),
    mergeMap(action => this.settlementsService.post(Settlement.toDto(action.settlement)).pipe(
      switchMap(settlement => [
        actions.CreateSettlementComplete({ settlementId: settlement.id, modal: action.modal }),
      ]),
      catchError(error => of(actions.Error({ errorMessage: error }))),
    )),
  ));


  createSettlementSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateSettlementComplete),
    tap(({ settlementId, modal }) => {
      modal.hide();
      this.router.navigate([`settlements/${settlementId}`]);
      this.toaster.showSuccess('New settlement was created');
    }),
  ), { dispatch: false });


  downloadDocuments$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadDocument),
    mergeMap(action => this.settlementsService.downloadDocument(action.id).pipe(
      switchMap(() => []),
      catchError(error => of(actions.DownloadDocumentError({ errorMessage: error }))),
    )),
  ));


  downloadDocumentError$ = createEffect(() => this.actions$.pipe(
    ofType(actions.DownloadDocumentError),
    tap(action => {
      this.toaster.showError(action.errorMessage);
    }),
  ), { dispatch: false });


  getClaimantListError$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClaimantListError),
    tap(action => {
      console.error(action.errorMessage); // eslint-disable-line no-console
      action.agGridParams.fail();
    }),
  ), { dispatch: false });


  getClaimantsList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClaimantList),
    mergeMap(action => this.settlementsService.getClaimantList(action.agGridParams.request, action.settlementId)
      .pipe(
        switchMap(response => [
          actions.GetClaimantListSuccess({
            claimants: response.items.map(Claimant.toModel),
            agGridParams: action.agGridParams,
            totalRecords: response.totalRecordsCount,
          })]),
        catchError(error => of(actions.GetClaimantListError({
          errorMessage: error,
          agGridParams: action.agGridParams,
        }))),
      )),
  ));


  getClaimantListComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetClaimantListSuccess),
    tap(action => {
      action.agGridParams.success({ rowData: action.claimants, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });


  getProjectListError$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProjectListError),
    tap(action => {
      console.error(action.errorMessage); // eslint-disable-line no-console
      action.agGridParams.fail();
    }),
  ), { dispatch: false });


  getProjectList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProjectList),
    mergeMap(action => this.settlementsService.getProjectList(action.agGridParams.request, action.settlementId)
      .pipe(
        switchMap(response => [
          actions.GetProjectListSuccess({
            projects: response.items.map(Project.toModel),
            agGridParams: action.agGridParams,
            totalRecords: response.totalRecordsCount,
          })]),
        catchError(error => of(actions.GetProjectListError({
          errorMessage: error,
          agGridParams: action.agGridParams,
        }))),
      )),
  ));


  getProjectListComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProjectListSuccess),
    tap(action => {
      action.agGridParams.success({ rowData: action.projects, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  // Financial Summary
  getGetFinancialSummaryError$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetFinancialSummaryError),
    tap(action => {
      this.toaster.showError(action.errorMessage);
    }),
  ), { dispatch: false });

  getGetFinancialSummary$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetFinancialSummary),
    mergeMap(action => this.settlementsService.getFinancialSummary(action.settlementId)
      .pipe(
        switchMap(response => {
          response?.totals.sort((a, b) => a.sortOrder - b.sortOrder);
          response?.rows.sort((a, b) => a.sortOrder - b.sortOrder);
          response?.inflows?.rows?.sort((a, b) => a.sortOrder - b.sortOrder);
          response?.outflows?.rows?.sort((a, b) => a.sortOrder - b.sortOrder);
          return [
            actions.GetFinancialSummarySuccess({
              financialSummary: response,
            })];
        }),
        catchError(error => of(actions.GetFinancialSummaryError({
          errorMessage: error,
        }))),
      )),
  ));
  //
}
