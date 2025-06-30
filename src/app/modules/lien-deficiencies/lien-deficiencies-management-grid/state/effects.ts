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
import { LienDeficienciesService, ToastService } from '@app/services';
import * as actions from './actions';
import { DeficiencyManagement } from '@app/models/lien-deficiencies/deficiency-management';
import { IdValue } from '@app/models/idValue';

@Injectable()
export class LienDeficienciesManagementGridEffects {
  constructor(
    private readonly lienDeficienciesService: LienDeficienciesService,
    private toaster: ToastService,
    private readonly actions$: Actions,
  ) { }

  getLienDeficiencyManagementList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetList),
    mergeMap(action => this.lienDeficienciesService.searchDeficienciesManagement(action.agGridParams.request)
      .pipe(
        switchMap(response => [
          actions.GetListComplete({
            lienDeficiencyManagementItems: response.items.map(DeficiencyManagement.toModel),
            agGridParams: action.agGridParams,
            totalRecords: response.totalRecordsCount,
          })]),
        catchError(error => of(actions.GetListError({
          errorMessage: error,
          agGridParams: action.agGridParams,
        }))),
      )),
  ));

  getLienDeficiencyManagementListComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetListComplete),
    tap(action => {
      action.agGridParams.success({ rowData: action.lienDeficiencyManagementItems, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });

  changeStatus$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ChangeStatus),
    mergeMap(action => this.lienDeficienciesService.changeStatus(action.id, action.status)
      .pipe(
        switchMap(() => [
          actions.ChangeStatusComplete()]),
        catchError(error => of(actions.ChangeStatusError({
          errorMessage: error,
        }))),
      )),
  ));

  changeStatusComplete$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ChangeStatusComplete),
    tap(() => {
      this.toaster.showSuccess('Status was updated');
    }),
  ), { dispatch: false });

  getDeficiencyCategories$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetDeficiencyCategories),
    mergeMap(() => this.lienDeficienciesService.getDeficiencyCategories()
      .pipe(
        switchMap(response => [
          actions.GetDeficiencyCategoriesComplete({deficiencyCategories: response.map(item => new IdValue(item.id, item.name))})]),
        catchError(error => of(actions.Error({error: error}))),
      )),
  ));

  error$ = createEffect(() => this.actions$.pipe(
    ofType(actions.Error),
    filter(action => isString(action.error)),
    tap(data => {
      this.toaster.showError(data.error);
    }),
  ), { dispatch: false });
}