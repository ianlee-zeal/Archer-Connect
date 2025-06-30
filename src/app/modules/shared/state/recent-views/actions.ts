import { createAction, props } from '@ngrx/store';
import { RecentView } from '@app/models';

const FEATURE_NAME = '[RecentViews]';

export const GetRecentViews = createAction(`${FEATURE_NAME} Get Recent Views`);
export const GetRecentViewsComplete = createAction(`${FEATURE_NAME} Get Recent Views Complete`, props<{ recentViews: RecentView[] }>());

export const CreateRecentView = createAction(`${FEATURE_NAME} Create Recent View`, props<{ view: RecentView }>());

export const Error = createAction(`${FEATURE_NAME} Error`, props<{ errorMessage: string }>());