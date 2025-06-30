import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { mergeMap, switchMap, catchError, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as services from '../../../../services';
import * as actions from './actions';
import { outcomeBasedPricingSelectors } from './selectors';

@Injectable()
export class OutcomeBasedPricingEffects {
  constructor(
    private brService: services.BillingRuleService,
    private readonly actions$: Actions,
    private store: Store<any>,
  ) { }

  getScenarios$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetScenarios),
    withLatestFrom(this.store.select(outcomeBasedPricingSelectors.scenarios)),
    mergeMap(([, scenarios]) => {
      if (scenarios && scenarios.length) {
        return [actions.GetScenariosSuccess({ scenarios })];
      }

      return this.brService.getScenarios()
        .pipe(
          switchMap(res => [actions.GetScenariosSuccess({ scenarios: res })]),
          catchError(error => [actions.Error(error)]),
        );
    }),
    catchError(error => of(actions.Error(error))),
  ));

  getVariablePricingTypes$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetVariablePricingTypes),
    withLatestFrom(this.store.select(outcomeBasedPricingSelectors.variablePricingTypes)),
    mergeMap(([, types]) => {
      if (types && types.length) {
        return [actions.GetVariablePricingTypesSuccess({ variablePricingTypes: types })];
      }
      return this.brService.getVariablePricingTypes()
        .pipe(
          switchMap(res => [actions.GetVariablePricingTypesSuccess({ variablePricingTypes: res })]),
          catchError(error => [actions.Error(error)]),
        );
    }),
    catchError(error => of(actions.Error(error))),
  ));

  getTriggerTypes$ = createEffect(() => this.actions$.pipe(
    ofType(actions.GetTriggerTypes),
    withLatestFrom(this.store.select(outcomeBasedPricingSelectors.triggerTypes)),
    mergeMap(([, types]) => {
      if (types && types.length) {
        return [actions.GetTriggerTypesSuccess({ triggerTypes: types })];
      }

      return this.brService.getTriggerTypes()
        .pipe(
          switchMap(res => [actions.GetTriggerTypesSuccess({ triggerTypes: res })]),
          catchError(error => [actions.Error(error)]),
        );
    }),
    catchError(error => of(actions.Error(error))),
  ));

  searchInjuryCategories$ = createEffect(() => this.actions$.pipe(
    ofType(actions.SearchInjuryCategories),
    mergeMap(action => this.brService.searchInjuryCategories(action.term, action.tortId)
      .pipe(
        switchMap(response => [actions.SearchInjuryCategoriesSuccess({ injuryCategories: response })]),
        catchError(error => [actions.Error(error)]),
      )),
  ));
}
