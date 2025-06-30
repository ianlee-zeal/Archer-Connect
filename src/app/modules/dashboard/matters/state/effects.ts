import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import { MattersService } from '@app/services/api/matters.service';
import { IdValue } from '@app/models';
import { Store } from '@ngrx/store';
import { ToastService } from '@app/services';
import * as rootActions from '@app/state/root.actions';
import { MatterState } from './reducer';
import { actions, selectors } from '.';

@Injectable()
export class MattersEffects {
  constructor(
    private mattersService: MattersService,
    private actions$: Actions,
    private store$: Store<MatterState>,
    private toaster: ToastService,
  ) { }


  getMatterLoadingStarted$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetMatterLoadingStarted),
    map(() => rootActions.LoadingStarted({
      actionNames: [
        actions.GetMatter.type,
      ],
    })),
  ));


  getMattersList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetMattersListRequest),
    mergeMap(action => this.mattersService.search(action.agGridParams.request)
      .pipe(
        switchMap(response => [
          actions.GetMattersListSuccess({
            matters: response.items,
            agGridParams: action.agGridParams,
            totalRecords: response.totalRecordsCount,
          })]),
        catchError(error => of(actions.GetMattersListError({
          errorMessage: error,
          agGridParams: action.agGridParams,
        }))),
      )),
  ));


  getMattersListSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetMattersListSuccess),
    tap(action => {
      action.agGridParams.success({ rowData: action.matters, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });


  getRelatedSettlementsList$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetRelatedSettlementsListRequest),
    mergeMap(action => this.mattersService.getRelatedSettlements(action.agGridParams.request, action.matterId)
      .pipe(
        switchMap(response => [
          actions.GetRelatedSettlementsListSuccess({
            agGridParams: action.agGridParams,
            relatedSettlements: response.items,
            totalRecords: response.totalRecordsCount,
          })]),
        catchError(error => of(actions.GetRelatedSettlementsListError({
          errorMessage: error,
          agGridParams: action.agGridParams,
        }))),
      )),
  ));


  getRelatedSettlementsListSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetRelatedSettlementsListSuccess),
    tap(action => {
      action.agGridParams.success({ rowData: action.relatedSettlements, rowCount: action.totalRecords});
    }),
  ), { dispatch: false });


  getMatter$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetMatter),
    switchMap(({ matterId }) => this.mattersService.getMatter(matterId).pipe(
      switchMap(response => [
        actions.GetMatterSuccess({ matter: response as IdValue }),
        rootActions.LoadingFinished({ actionName: actions.GetMatter.type })]),
      catchError(error => of(actions.MatterError({ error }))),
    )),
  ));


  createMatter$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateMatter),
    switchMap(({ matterName }) => this.mattersService.createMatter(matterName).pipe(
      switchMap(() => [
        actions.CreateMatterSuccess(),
        actions.RefreshMattersRequest(),
      ]),
      catchError(error => of(actions.MatterError({ error }))),
    )),
  ));


  CreateMatterSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(actions.CreateMatterSuccess),
    tap(() => {
      this.toaster.showSuccess('New matter was created');
    }),
  ), { dispatch: false });


  refreshMattersRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.RefreshMattersRequest),
    withLatestFrom(this.store$.select(selectors.agGridParams)),
    switchMap(([,agGridParams]) => [
      actions.GetMattersListRequest({ agGridParams }),
    ]),
  ));

}
