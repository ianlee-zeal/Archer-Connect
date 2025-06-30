import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { createAction, props } from '@ngrx/store';

export const FEATURE_NAME = '[Auditor]';

export const Error = createAction(`${FEATURE_NAME} API Error`, props<{ errorMessage: string }>());
export const UpdateActionBar = createAction(`${FEATURE_NAME} Update Action Bar`, props<{ actionBar: ActionHandlersMap }>());
