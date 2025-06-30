import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { Router } from '@angular/router';
import { NavigateToProjectDisbursementGroupsTab } from './navigational.actions';

@Injectable()
export class NavigationalEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly router: Router,
  ) { }


  navigateToProjectDisbursementGroupsTab$ = createEffect(() => this.actions$.pipe(
    ofType(NavigateToProjectDisbursementGroupsTab),
    tap(({ projectId }) => {
      this.router.navigate([`/projects/${projectId}/payments/tabs/groups`]);
    }),
  ), { dispatch: false });
}
