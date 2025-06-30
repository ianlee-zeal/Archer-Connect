import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mergeMap, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import * as services from '@app/services';
import * as actions from './actions';

@Injectable()
export class UserRolesListEffects {
  constructor(
    private actions$: Actions,
    private usersService: services.UsersService,
  ) {
  }

  getUserRolesListRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetUserRolesListRequest),
    mergeMap(action => this.usersService.getRoles(action.userId)
      .pipe(
        switchMap(userRolesList => [actions.GetUserRolesListRequestComplete({ userRolesList })]),
        catchError(error => of(actions.Error({ errorMessage: error }))),
      )),
  ));
}
