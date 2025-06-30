import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs/operators';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as fromDashbaord from '.';
import * as dashboardActions from './actions';

@Injectable()
export class DashboardEffects {
  constructor(
    private actions$: Actions,
    private store: Store<fromDashbaord.AppState>,
    private router: Router,
  ) { }


  gotoDoсumentsList$ = createEffect(() => this.actions$.pipe(
    ofType(dashboardActions.GotoDocumentsList),
    tap(() => {
      this.router.navigate(['dashboard', 'documents'], { state: { restoreSearch: true } });
    }),
  ), { dispatch: false });

  // Persons

  gotoPersonDetails$ = createEffect(() => this.actions$.pipe(
    ofType(dashboardActions.GotoPersonDetials),
    tap(action => {
      this.router.navigate(['dashboard', 'persons', action.personId]);
    }),
  ), { dispatch: false });


  gotoPersonsList$ = createEffect(() => this.actions$.pipe(
    ofType(dashboardActions.GotoPersonsList),
    tap(() => {
      this.router.navigate(['dashboard', 'persons'], { state: { restoreSearch: true } });
    }),
  ), { dispatch: false });
}
