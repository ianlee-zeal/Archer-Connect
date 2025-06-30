import { createReducer, on, Action } from '@ngrx/store';
import {
  ProjectProductCategory,
  ProductCondition,
} from '@app/models/scope-of-work';
import * as actions from './actions';
import { IdValue } from '@app/models';

export interface ScopeOfWorkState {
  error: string;
  loading: boolean;

  allProducts: ProjectProductCategory[];
  allProductConditions: ProductCondition[];

  productCategories: ProjectProductCategory[]; // productCategories' assembled info

  projectsLight: IdValue[];
}

export const scopeOfWorkInitialState: ScopeOfWorkState = {
  error: null,
  loading: false,

  allProducts: [],
  allProductConditions: [],

  productCategories: [],

  projectsLight: [],
};

export const scopeOfWorkReducer = createReducer(
  scopeOfWorkInitialState,

  on(
    actions.GetAllProductsAndConditionsSuccess,
    (state, { allProducts, allProductConditions }) => ({
      ...state,
      allProducts,
      allProductConditions,
    })
  ),

  on(actions.GetProductCategoriesSuccess, (state, { productCategories }) => ({
    ...state,
    productCategories,
  })),

  on(actions.ResetProductCategories, state => ({
    ...state,
    productCategories: [],
  })),

  on(actions.Error, (state, { error }) => ({ ...state, error })),

  on(actions.GetProjectsLightList, state => ({
    ...state,
    loading: true,
  })),

  on(actions.GetProjectsLightListSuccess, (state, { projectsLight }) => ({
    ...state,
    projectsLight,
    loading: false,
  })),

  on(actions.CopyProjectSettingsSuccess, state => ({
    ...state,
    error: null,
    loading: false,
  }))
);

export function mainReducer(
  state: ScopeOfWorkState | undefined,
  action: Action
) {
  return scopeOfWorkReducer(state, action);
}
