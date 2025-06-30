import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mergeMap, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { RecentView } from '@app/models';
import * as services from '@app/services';
import * as rootActions from '@app/state/root.actions';
import * as actions from './actions';

@Injectable()
export class RecentViewsEffects {
  private readonly defViewsCount = 5;

  constructor(
    private readonly actions$: Actions,
    private readonly recentViewService: services.RecentViewService,
  ) { }


  getRecentViews$ = createEffect(() => this.actions$.pipe(ofType(actions.GetRecentViews),
    mergeMap(() => this.recentViewService.getList(this.defViewsCount)
      .pipe(switchMap(response => {
        const recentViews = response.items.map(item => RecentView.toModel(item));

        return [
          actions.GetRecentViewsComplete({ recentViews }),
          rootActions.LoadingFinished({ actionName: actions.GetRecentViews.type }),
        ];
      }),
      catchError(error => of(actions.Error({ errorMessage: error })))))));


  createViewedPage$ = createEffect(() => this.actions$.pipe(ofType(actions.CreateRecentView),
    mergeMap(action => this.recentViewService.create(action.view)
      .pipe(switchMap(() => [actions.GetRecentViews()]),
        catchError(error => of(actions.Error({ errorMessage: error })))))));
}
