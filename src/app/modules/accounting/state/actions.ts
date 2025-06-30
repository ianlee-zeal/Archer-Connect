import { createAction, props } from '@ngrx/store';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';

const featureName = '[Accounting]';

export const UpdateActionBar = createAction(`[${featureName}] Update Action Bar`, props<{ actionBar: ActionHandlersMap }>());

export const Error = createAction(`${featureName} Error Message`, props<{ error: string }>());
