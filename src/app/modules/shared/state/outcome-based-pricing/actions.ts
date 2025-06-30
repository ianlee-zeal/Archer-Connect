import { IdValue, InjuryCategory } from '@app/models';
import { createAction, props } from '@ngrx/store';

export const featureName = '[Outcome Based Pricing]';

export const GetVariablePricingTypes = createAction(`${featureName} Get VariablePricingTypes`);
export const GetVariablePricingTypesSuccess = createAction(`${featureName} Get VariablePricingTypes Success`, props<{ variablePricingTypes: IdValue[] }>());

export const GetScenarios = createAction(`${featureName} Get Scenarios`);
export const GetScenariosSuccess = createAction(`${featureName} Get Scenarios Success`, props<{ scenarios: IdValue[] }>());

export const GetTriggerTypes = createAction(`${featureName} Get Trigger Types`);
export const GetTriggerTypesSuccess = createAction(`${featureName} Get Trigger types Success`, props<{ triggerTypes: IdValue[] }>());

export const SearchInjuryCategories = createAction(`${featureName} Search Injury Categories`, props<{ term?: string, tortId?: number }>());
export const SearchInjuryCategoriesSuccess = createAction(`${featureName} Search Injury Categories Success`, props<{ injuryCategories: InjuryCategory[] }>());

export const Error = createAction(`${featureName} Error`, props<{ error: any }>());
