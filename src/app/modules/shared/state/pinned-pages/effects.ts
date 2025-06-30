import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mergeMap, switchMap, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import { PinnedPage } from '@app/models';
import * as actions from './actions';
import * as services from '@app/services';

@Injectable()
export class PinnedPagesEffects {
  constructor(
    private actions$: Actions,
    private pinnedPageService: services.PinnedPageService,
    private toaster: services.ToastService,
  ) { }


  getPinnedPages$ = createEffect(() => this.actions$.pipe(ofType(actions.GetPinnedPages),
    mergeMap(() => this.pinnedPageService.getList()
      .pipe(switchMap(response => {
        const pinnedPages = response.items.map(item => PinnedPage.toModel(item));

        return [actions.GetPinnedPagesComplete({ pinnedPages })];
      }),
        catchError(error => of(actions.Error({ errorMessage: error }))))),
  ));


  createPinnedPage$ = createEffect(() => this.actions$.pipe(ofType(actions.CreatePinnedPage),
    mergeMap(action => this.pinnedPageService.create(action.view)
      .pipe(switchMap(() => {
        action.callback();
        return [actions.GetPinnedPages()]
      }),
        catchError(error => of(actions.Error({ errorMessage: error }))))),
  ));


  removePinnedPage$ = createEffect(() => this.actions$.pipe(ofType(actions.RemovePinnedPage),
    mergeMap(action => this.pinnedPageService.deleteByEntity(action.entityId, action.entityType)
      .pipe(switchMap(() => {
        action.callback();
        return [actions.GetPinnedPages()]
      }),
        catchError(error => of(actions.Error({ errorMessage: error }))))),
  ));


  error$ = createEffect(() => this.actions$.pipe(
    ofType(actions.Error),
    tap(action => this.toaster.showError(action.errorMessage)),
  ), { dispatch: false });
}
