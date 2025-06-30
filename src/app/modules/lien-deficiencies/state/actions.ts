import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { createAction, props } from '@ngrx/store';

export const FEATURE_NAME = '[Lien Deficiencies]';

export const Error = createAction(`${FEATURE_NAME} API Error`, props<{ error: any }>());
export const UpdateActionBar = createAction(`${FEATURE_NAME} Update Action Bar`, props<{ actionBar: ActionHandlersMap }>());
