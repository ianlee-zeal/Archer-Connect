import { createAction, props } from '@ngrx/store';
import { SearchState } from '@app/models/advanced-search/search-state';
import memoize from 'lodash.memoize';

export const SaveSearchParamsFor = memoize((featureName: string) => createAction(`[${featureName}] Save Advanced Search Items`, props<{ items: SearchState[] }>()));

export const SaveAdvancedSearchVisibilityFor = memoize((featureName: string) => createAction(`[${featureName}] Toggle Advanced Search Visibility`, props<{ isVisible: boolean }>()));

export const SetShowExpandButtonForFilters = memoize((featureName: string) => createAction(`[${featureName}] Set Show Expand Button For Filters`, props<{ showExpandBtn: boolean }>()));
