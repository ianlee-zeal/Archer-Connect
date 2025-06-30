import { createAction, props } from '@ngrx/store';
import { InjuryCategory } from '@app/models';

export const FEATURE_NAME = 'Shared Pricing Components List';

export const SearchInjuryCategories = createAction(`${FEATURE_NAME} Search Injury Categories`, props<{ term?: string, tortId?: number }>());
export const SearchInjuryCategoriesSuccess = createAction(`${FEATURE_NAME} Search Injury Categories Success`, props<{ injuryCategories: InjuryCategory[] }>());

export const Error = createAction(`${FEATURE_NAME} Error`, props<{ errorMessage: string }>());
