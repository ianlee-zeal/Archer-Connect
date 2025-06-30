import { createAction, props } from '@ngrx/store';
import { ActionHandlersMap } from '../../action-bar/action-handlers-map';

const featureName = '[Shared Exports]';

export const SetExportStatus = createAction(`${featureName} Set Export Status`, props<{ isExporting: boolean }>());
export const ShowAlertLienDataExportDuplicateError = createAction(`${featureName} Show Alert Lien Data Export Duplicate Error`);

export const SetActionStatus = createAction(`${featureName} Set Action Status`, props<{ isActionInProgress: boolean }>());

export const UpdateActionBar = createAction(`${featureName} Update Action Bar`, props<{ actionBar: ActionHandlersMap }>());
