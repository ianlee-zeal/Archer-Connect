import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { forkJoin, of } from 'rxjs';
import {
  mergeMap,
  switchMap,
  catchError,
  withLatestFrom,
  tap,
  filter,
  map,
} from 'rxjs/operators';

import isString from 'lodash-es/isString';

import {
  ToastService,
  ProductsService,
  ProjectProductCategoriesService,
  ProjectProductService,
  ProjectProductConditionsService,
  ProjectsService,
} from '@app/services';
import {
  ProjectProductCategory,
  ProjectProductCondition,
} from '@app/models/scope-of-work';

import { IdValue } from '@app/models';
import { Page } from '@app/models/page';
import * as actions from './actions';
import { scopeOfWorkSelectors } from './selectors';
import { ScopeOfWorkState } from './reducer';

@Injectable()
export class ScopeOfWorkEffects {
  constructor(
    private productsService: ProductsService,
    private projectProductCategoriesService: ProjectProductCategoriesService,
    private projectProductService: ProjectProductService,
    private projectProductConditionsService: ProjectProductConditionsService,
    private actions$: Actions,
    private store: Store<ScopeOfWorkState>,
    private toaster: ToastService,
    private projectsService: ProjectsService,
  ) {}

  getAllProductAndConditions$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetAllProductsAndConditions),
    mergeMap(() => forkJoin(
      this.productsService.getAllProductsGroupedByCategories(),
      this.projectProductConditionsService.getAllProductConditions(),
    ).pipe(
      switchMap(([allProducts, allProductConditions]) => [
        actions.GetAllProductsAndConditionsSuccess({
          allProducts,
          allProductConditions,
        }),
      ]),
      catchError(err => of(actions.Error({ error: err.message }))),
    )),
  ));

  getProductCategories$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProductCategories),
    withLatestFrom(
      this.store.select(scopeOfWorkSelectors.allProducts),
      this.store.select(scopeOfWorkSelectors.allProductConditions),
    ),
    filter(
      ([, allProducts, allProductConditions]) => allProducts?.length > 0 && allProductConditions?.length > 0,
    ),
    mergeMap(([action, allProducts, allProductConditions]) => forkJoin(
      this.projectProductCategoriesService.getProjectProductCategories(
        action.projectId,
      ),
      this.projectProductService.getProjectProducts(action.projectId),
      this.projectProductConditionsService.getProjectProductConditions(
        action.projectId,
      ),
    ).pipe(
      switchMap(
        ([
          projectProductCategories, // all productCategories with their statuses, ids, parentIds
          projectProducts, // checked products
          projectProductConditions, // checked conditions
        ]) => {
          action.callback();

          const products = allProducts.map(elem => ProjectProductCategory.toModel(elem));
          const productCategories = projectProductCategories.map(item => ProjectProductCategory.toExtendedModel(
            item,
            products,
            projectProducts,
          ));
          if (allProductConditions.length) {
            const parentIds = [];
            productCategories.forEach(category => {
              const parentId = category.productCategory.parentId;
              if (!!parentId && !parentIds.includes(parentId)) {
                parentIds.push(parentId);
              }
              const products = category.products;
              if (products.length) {
                products.forEach(product => {
                  const productConditions = allProductConditions.filter(
                    condition => condition.product.id === product.id,
                  );
                  const conds = productConditions.map(x => {
                    const productConditionId = x.id;
                    const checkedCondition = projectProductConditions.find(
                      c => c.productConditionId === productConditionId,
                    );
                    return ProjectProductCondition.toModel({
                      id: checkedCondition?.id,
                      caseProductId: checkedCondition?.caseProductId,
                      productConditionId,
                      isChecked: !!checkedCondition?.caseProductId,
                      name: x.name,
                    });
                  });
                  product.conditions = conds;
                });
              }
            });

            parentIds.forEach(parentId => {
              const parentCategory = productCategories.find(
                category => category.productCategoryId === parentId,
              );
              if (parentCategory) {
                parentCategory.childs = productCategories.filter(
                  category => category.productCategory.parentId === parentId,
                );
              }
            });
          }

          return [
            actions.GetProductCategoriesSuccess({
              projectProductCategories,
              projectProducts,
              projectProductConditions,
              productCategories,
            }),
          ];
        },
      ),
      catchError(err => of(actions.Error({ error: err.message }))),
    )),
  ));

  updateProductCategories$ = createEffect((): any => this.actions$.pipe(
    ofType(actions.UpdateProductCategories),
    mergeMap(({ projectId, productCategories, callback }) => this.projectProductCategoriesService
      .updateProjectProductCategories(projectId, {
        productCategories: productCategories.map(item => ProjectProductCategory.toDto(item)),
      })
      .pipe(
        switchMap(result => (result
          ? [
            actions.ResetProductCategories(),
            actions.GetProductCategories({
              projectId,
              callback,
            }),
          ]
          : [result])),
        catchError(err => of(actions.Error({ error: err.message }))),
      )),
  ));

  updateProductCategoriesSuccess$ = createEffect(
    () => this.actions$.pipe(
      ofType(actions.UpdateProductCategoriesSuccess),
      tap(() => this.toaster.showSuccess('Product categories updated')),
    ),
    { dispatch: false },
  );

  error$ = createEffect(
    () => this.actions$.pipe(
      ofType(actions.Error),
      filter(action => isString(action.error)),
      tap(data => {
        this.toaster.showError(data.error);
      }),
    ),
    { dispatch: false },
  );

  getProjectsLightList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProjectsLightList),
    mergeMap(action => this.projectsService.getProjectCasesList(action.params).pipe(
      switchMap((response: Page<IdValue>) => [
        actions.GetProjectsLightListSuccess({
          projectsLight: response.items,
          totalRecords: response.totalRecordsCount,
        }),
      ]),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));

  copyProjectSettings$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CopyProjectSettings),
    mergeMap(({ projectId, formValues, callback }) => this.projectsService.copySettings(projectId, formValues).pipe(
      tap(() => this.toaster.showSuccess('Project settings copied successfully')),
      map(() => actions.CopyProjectSettingsSuccess({ callback })),
      catchError(err => of(actions.Error({ error: err.message }))),
    )),
  ));

  copyProjectSettingsSuccess$ = createEffect(
    () => this.actions$.pipe(
      ofType(actions.CopyProjectSettingsSuccess),
      tap(({ callback }) => callback()),
    ),
    { dispatch: false },
  );

  getProductScopeContactsList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProductScopeContactsList),
    mergeMap(action => this.projectProductCategoriesService.getProductScopeContactsList(action.projectId, action.agGridParams.request)
      .pipe(
        switchMap(response => {
          const contacts = response;
          return [
            actions.GetProductScopeContactsListSuccess({
              contacts,
              totalRecords: response.length,
              agGridParams: action.agGridParams,
            }),
          ];
        }),
        catchError(error => of(actions.Error({ error }))),
      )),
  ));

  getContactsListSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetProductScopeContactsListSuccess),
    tap(action => {
      action.agGridParams?.success({ rowData: action.contacts, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });
}
