import { createReducer, on, Action } from '@ngrx/store';

import { IdValue, InjuryCategory } from '@app/models';
import * as actions from './actions';

export interface OutcomeBasedPricingState {
  scenarios: IdValue[];
  triggerTypes: IdValue[];
  variablePricingTypes: IdValue[];
  injuryCategories: InjuryCategory[];
  outcomeBasedPricings: IdValue[];
  error: any,
}

const initialState: OutcomeBasedPricingState = {
  scenarios: null,
  triggerTypes: null,
  variablePricingTypes: null,
  injuryCategories: null,
  outcomeBasedPricings: null,
  error: null,
};

// main reducer function
const outcomeBasedPricingReducer = createReducer(
  initialState,

  on(actions.GetScenariosSuccess, (state, { scenarios }) => ({ ...state, scenarios })),

  on(actions.GetTriggerTypesSuccess, (state, { triggerTypes }) => ({ ...state, triggerTypes })),

  on(actions.GetVariablePricingTypesSuccess, (state, { variablePricingTypes }) => ({ ...state, variablePricingTypes })),

  on(actions.SearchInjuryCategoriesSuccess, (state, { injuryCategories }) => ({ ...state, injuryCategories })),

);

// we have to wrap our reducer like this or it won't compile in prod
export function OutcomeBasedPricingReducer(state: OutcomeBasedPricingState | undefined, action: Action) {
  return outcomeBasedPricingReducer(state, action);
}
