import { Injectable } from '@angular/core';
import { BankAccountService, OrgsService } from '@app/services';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, switchMap } from 'rxjs';
import * as actions from './actions';

@Injectable()
export class UploadW9Effects {
  constructor(
    private readonly actions$: Actions,
    private readonly orgsService: OrgsService,
    private readonly bankAccountsService: BankAccountService,
  ) { }

  uploadW9File$ = createEffect(() => this.actions$.pipe(
    ofType(actions.UploadW9),
    mergeMap(action => this.orgsService.uploadW9File(action.file)
      .pipe(
        switchMap(response => [actions.UploadW9Success({ result: response })]),
        catchError(error => of(actions.UploadW9Error({ errorMessage: error }))),
      ))
  ));

  getW9Settings$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetW9Settings),
    mergeMap(() => this.orgsService.getOrganizationW9Settings().pipe(
      map(data => actions.GetW9SettingsSuccess({ data })),
      catchError(error => of(actions.Error({ error }))),
    )),
  ));
}
