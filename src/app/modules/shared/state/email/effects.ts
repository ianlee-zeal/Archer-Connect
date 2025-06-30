import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { mergeMap, switchMap, catchError, tap } from 'rxjs/operators';
import { ToastService, EmailsService } from '@app/services';
import { Email } from '@app/models';
import * as actions from './actions';

@Injectable()
export class EmailEffects {
  constructor(
    private emailService: EmailsService,
    private toaster: ToastService,
    private actions$: Actions,
  ) { }

  getPrimaryEmailByEntity$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetPrimaryEmailByEntity),
    mergeMap(action => this.emailService.getPrimaryByEntity(action.entityType, action.entityId).pipe(
      switchMap((response: Email) => [
        actions.GetPrimaryEmailByEntityComplete({ primaryEmail: response }),
      ]),
      catchError((error: string) => of(actions.Error({ errorMessage: error }))),
    )),
  ));

  error$ = createEffect(() => this.actions$.pipe(
    ofType(actions.Error),
    tap(action => this.toaster.showError(action.errorMessage)),
  ), { dispatch: false });
}
