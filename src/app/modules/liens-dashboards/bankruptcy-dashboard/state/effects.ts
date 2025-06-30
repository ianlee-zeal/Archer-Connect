import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mergeMap, switchMap, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import * as actions from './actions';
import * as services from '@app/services';
import { LienStatusSummary, LienPhaseSummary, LienTypeSummary, LienPhase, IdValue } from '@app/models';

@Injectable()
export class BankruptcyDashboardEffects {
  constructor(
    private projectsService: services.ProjectsService,
    private productsService: services.ProductsService,
    private phasesService: services.PhasesService,
    private stagesService: services.StagesService,

    private actions$: Actions,
    private router: Router,
  ) { }


  getStagesSummary$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.GetStagesSummary),
    mergeMap(action =>
      this.projectsService.getProductStatusesSummary(
        action.rootProductCategoryId,
        action.projectId,
        action.lienTypes,
        action.lienPhases,
        null,
        action.bypassSpinner)
        .pipe(
          switchMap(response => [actions.GetStagesSummarySuccess({ summary: new LienStatusSummary(response) })]),
          catchError(error => of(actions.Error({ errorMessage: error }))),
        )),
  ));


  getPhasesSummary$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.GetPhasesSummary),
    mergeMap(action =>
      this.projectsService.GetProductPhasesSummary(
        action.rootProductCategoryId,
        action.projectId,
        action.lienTypes,
        action.lienPhases,
        action.clientStages)
        .pipe(
          switchMap(response => [actions.GetPhasesSummarySuccess({ summary: new LienPhaseSummary(response) })]),
          catchError(error => of(actions.Error({ errorMessage: error }))),
        )),
  ));


  getTypesSummary$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.GetTypesSummary),
    mergeMap(action =>
      this.projectsService.GetProductTypesSummary(
        action.rootProductCategoryId,
        action.projectId,
        action.lienPhases,
        action.clientStages)
        .pipe(
          switchMap(response => [actions.GetTypesSummarySuccess({ summary: new LienTypeSummary(response) })]),
          catchError(error => of(actions.Error({ errorMessage: error }))),
        )),
  ));


  GetProductPhasesList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProductPhasesList),
    mergeMap(action => this.phasesService.getByProductIds([action.productCategoryId])
      .pipe(
        switchMap((response: LienPhase[]) => [actions.GetProductPhasesListSuccess({ phases: response })]),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));


  GetProductTypesList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProductTypesList),
    mergeMap(action => this.productsService.getByProductCategoryIds([action.productCategoryId])
      .pipe(
        switchMap((response: IdValue[]) => [actions.GetProductTypesListSuccess({ types: response })]),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));


  getProject$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProject),
    mergeMap(action => this.projectsService.get(action.id)
      .pipe(
        switchMap(item => [
          actions.GetProjectComplete({ projectDetails: item }),
        ]),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));


  back$ = createEffect(() => this.actions$.pipe(ofType(actions.Back),
    tap(action =>
      this.router.navigate(['projects', action.projectId]))
  ), { dispatch: false });


  GetProductStagesList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProductStagesList),
    mergeMap(action => this.stagesService.getDropdownByProductCategories([action.productCategoryId]).pipe(
      switchMap((data: IdValue[]) => [
        actions.GetProductStagesListSuccess({ stages: data }),
      ]),
      catchError(error => of(actions.Error({ errorMessage: error }))),
    )),
  ));
}
