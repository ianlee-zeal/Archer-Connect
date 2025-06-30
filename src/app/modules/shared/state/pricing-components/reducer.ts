import { createReducer, on, Action } from '@ngrx/store';
import { InjuryCategory } from '@app/models';
import * as actions from "./actions"

export interface PricingComponentsState {
  injuryCategories: InjuryCategory[];
}

const initialState: PricingComponentsState = {
  injuryCategories: [],
};

export const pricingComponentsReducer = createReducer(
  initialState,
  on(actions.SearchInjuryCategoriesSuccess, (state, { injuryCategories }) => ({ ...state, injuryCategories })),
  on(actions.Error, (state, { errorMessage }) => ({ ...state, error: errorMessage })),
);

export function PricingComponentsReducer(state: PricingComponentsState | undefined, action: Action) {
  return pricingComponentsReducer(state, action);
}
