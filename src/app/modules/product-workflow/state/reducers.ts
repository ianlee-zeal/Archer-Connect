import { createReducer, on, Action } from '@ngrx/store';

import * as actions from './actions';
import { ProductWorkflowDropdownValues, ProductWorkflowDataEnumTypes } from '@app/models/product-workflow';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';

export interface ProductWorkflowState {
  error: any,
  dropdownValues: ProductWorkflowDropdownValues,
}

export const initialState: ProductWorkflowState = {
  error: null,
  dropdownValues: new ProductWorkflowDropdownValues(),
}

function setDropdownValues(state: ProductWorkflowDropdownValues, values: SelectOption[], input: ProductWorkflowDataEnumTypes): ProductWorkflowDropdownValues {
  switch (input)
  {
    case ProductWorkflowDataEnumTypes.ProductCategories:
      state.productCategories = values;
      state.subProductCategories = null;
      state.phases = null;
      state.products = null;
      state.stages = null;
      break;
    case ProductWorkflowDataEnumTypes.SubProductCategories:
      state.subProductCategories = values;
      break;
    case ProductWorkflowDataEnumTypes.Products:
      state.products = values;
      break;
    case ProductWorkflowDataEnumTypes.Phases:
      state.phases = values;
      break;
    case ProductWorkflowDataEnumTypes.StagesByCategory:
      state.stages = values;
      break;
    case ProductWorkflowDataEnumTypes.StagesByPhase:
      state.stages = values;
      break;
  }

  return state;
}

// main reducer function
const productWorkflowReducer = createReducer(
  initialState,
  on(actions.Error, (state, { error }) => ({
    ...state, error
  })),
  on(actions.GetProductCategoryDropdownSuccess, (state, { productCategories }) => ({
    ...state, dropdownValues: setDropdownValues(state.dropdownValues, productCategories, ProductWorkflowDataEnumTypes.ProductCategories)
  })),
  on(actions.GetSubProductCategoryDropdownSuccess, (state, { subProductCategories }) => ({
    ...state, dropdownValues: setDropdownValues(state.dropdownValues, subProductCategories, ProductWorkflowDataEnumTypes.SubProductCategories)
  })),
  on(actions.GetProductDropdownSuccess, (state, { products }) => ({
    ...state, dropdownValues: setDropdownValues(state.dropdownValues, products, ProductWorkflowDataEnumTypes.Products)
  })),
  on(actions.GetPhaseDropdownSuccess, (state, { phases }) => ({
    ...state, dropdownValues: setDropdownValues(state.dropdownValues, phases, ProductWorkflowDataEnumTypes.Phases)
  })),
  on(actions.GetStageDropdownSuccess, (state, { stages }) => ({
    ...state, dropdownValues: setDropdownValues(state.dropdownValues, stages, ProductWorkflowDataEnumTypes.StagesByCategory)
  })),
);


// we have to wrap our reducer like this or it won't compile in prod
export function ProductWorkflowReducer(state: ProductWorkflowState | undefined, action: Action) {
  return productWorkflowReducer(state, action);
}

export const FEATURE_NAME = 'product_workflow_feature';
