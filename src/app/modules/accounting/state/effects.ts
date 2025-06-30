/* eslint-disable arrow-body-style */
import { ToastService } from '@app/services';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import * as actions from './actions';

@Injectable()
export class AccountingEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly toasterService: ToastService,
  ) { }

  error$ = createEffect(() => this.actions$.pipe(
    ofType(actions.Error),
    tap(data => {
      this.toasterService.showError(data.error);
    }),
  ), { dispatch: false });
}
