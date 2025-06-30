import { Injectable } from '@angular/core';
import { mergeMap, catchError,  switchMap } from 'rxjs/operators';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';

import { BillingRuleService, ToastService } from '@app/services';

import * as actions from './actions';

@Injectable()
export class PricingComponentsEffects {
  constructor(
    private brService: BillingRuleService,
    private actions$: Actions,
    private toaster: ToastService,
    private store$: Store<PricingComponentsEffects>,
  ) { }

  searchInjuryCategories$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchInjuryCategories),
    mergeMap(action => this.brService.searchInjuryCategories(action.term, action.tortId)
      .pipe(
        switchMap(response => [actions.SearchInjuryCategoriesSuccess({ injuryCategories: response })]),
        catchError(error => [actions.Error(error)]),
      )),
  ));
}
