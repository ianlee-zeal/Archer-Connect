import { Injectable } from '@angular/core';
import { createEffect, ofType, Actions } from '@ngrx/effects';
import { mergeMap, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import * as actions from './actions';
import { ProductsService, StagesService, PhasesService,  } from '@app/services';
import { IdValue } from '@app/models';
import { ProductCategoriesService } from '@app/services/api/product-categories.service';

@Injectable()
export class ProductWorkflowEffects {
  constructor(
      private productCategoriesService: ProductCategoriesService,
      private productsService: ProductsService,
      private stagesService: StagesService,
      private phasesService: PhasesService,
      private actions$: Actions,
  ) { }


  getProductCategoryDropdown$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProductCategoryDropdownRequest),
    mergeMap(() => this.productCategoriesService.getDropdownProductCategories().pipe(
      switchMap((data: IdValue[]) => [
        actions.GetProductCategoryDropdownSuccess({ productCategories: data }),
      ]),
      catchError(error => of(actions.Error({ error: error }))),
    )),
  ));


  getSubProductCategoryDropdown$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetSubProductCategoryDropdownRequest),
    mergeMap(action => this.productCategoriesService.getDropdownByProductCategories(action.ids).pipe(
      switchMap((data: IdValue[]) => [
        actions.GetSubProductCategoryDropdownSuccess({ subProductCategories: data }),
      ]),
      catchError(error => of(actions.Error({ error: error }))),
    )),
  ));


  getProductDropdownRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProductDropdownRequest),
    mergeMap(action => this.productsService.getByProductCategoryIds(action.ids, action.categoryIds).pipe(
      switchMap((data: IdValue[]) => [
        actions.GetProductDropdownSuccess({ products: data }),
      ]),
      catchError(error => of(actions.Error({ error: error }))),
    )),
  ));


  getPhaseDropdownRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPhaseDropdownRequest),
    mergeMap(action => this.phasesService.getByProductIds(action.ids).pipe(
      switchMap((data: IdValue[]) => [
        actions.GetPhaseDropdownSuccess({ phases: data }),
      ]),
      catchError(error => of(actions.Error({ error: error }))),
    )),
  ));


  getStageDropdownByCatetgoryRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetStageDropdownByCatetgoryRequest),
    mergeMap(action => this.stagesService.getDropdownByProductCategories(action.ids).pipe(
      switchMap((data: IdValue[]) => [
        actions.GetStageDropdownSuccess({ stages: data }),
      ]),
      catchError(error => of(actions.Error({ error: error }))),
    )),
  ));


  getStageDropdownByPhaseRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetStageDropdownByPhaseRequest),
    mergeMap(action => this.stagesService.getDropdownByPhaseIds(action.ids, action.categoryIds).pipe(
      switchMap((data: IdValue[]) => [
        actions.GetStageDropdownSuccess({ stages: data }),
      ]),
      catchError(error => of(actions.Error({ error: error }))),
    )),
  ));
}
