import { createAction, props } from '@ngrx/store';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';

const featureName = '[Product Workflow]';

export const GetProductCategoryDropdownRequest = createAction(`${featureName} Get Product Category Dropdown Request`);
export const GetProductCategoryDropdownSuccess = createAction(`${featureName} Get Product Category Dropdown Success`, props<{ productCategories: SelectOption[] }>());

export const GetSubProductCategoryDropdownRequest = createAction(`${featureName} Get Sub Product Category Dropdown Request`, props<{ ids: number[] }>());
export const GetSubProductCategoryDropdownSuccess = createAction(`${featureName} Get Sub Product Category Dropdown Success`, props<{ subProductCategories: SelectOption[] }>());

export const GetProductDropdownRequest = createAction(`${featureName} Get Product Dropdown Request`, props<{ ids: number[], categoryIds: number[] }>());
export const GetProductDropdownSuccess = createAction(`${featureName} Get Product Dropdown Success`, props<{ products: SelectOption[] }>());

export const GetPhaseDropdownRequest = createAction(`${featureName} Get Phase Dropdown Request`, props<{ ids: number[] }>());
export const GetPhaseDropdownSuccess = createAction(`${featureName} Get Phase Dropdown Success`, props<{ phases: SelectOption[] }>());

export const GetStageDropdownByCatetgoryRequest = createAction(`${featureName} Get Stage Dropdown By Category Request`, props<{ ids: number[] }>());
export const GetStageDropdownByPhaseRequest = createAction(`${featureName} Get Stage Dropdown By Phase Request`, props<{ ids: number[], categoryIds: number[] }>());
export const GetStageDropdownSuccess = createAction(`${featureName} Get Stage Dropdown Success`, props<{ stages: SelectOption[] }>());

export const Error = createAction(`${featureName} Error`, props<{ error: any }>());