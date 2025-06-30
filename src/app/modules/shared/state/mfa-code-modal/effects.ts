import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mergeMap, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import * as actions from './actions';
import * as services from '../../../../services';

@Injectable()
export class MfaCodeModalEffects {
  constructor(
    private actions$: Actions,
    private usersService: services.UsersService,
  ) { }


  sendMfaCodeRequest$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SendMfaCodeRequest),
    mergeMap(action => this.usersService.sendMfaCode(action.userGuid)
      .pipe(switchMap(() => [actions.SendMfaCodeSuccess()]),
        catchError(error => of(actions.GetMfaCodeError({ errorMessage: error }))))),
  ));


  sendMfaCodeRequestForNewAuthyUser$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SendMfaCodeRequestForNewAuthyUser),
    mergeMap(action => this.usersService.createAuthy(action.request)
      .pipe(switchMap(result => [actions.SendMfaCodeRequestForNewAuthyUserSuccess({ result })]),
        catchError(error => of(actions.GetMfaCodeError({ errorMessage: error }))))),
  ));
}
