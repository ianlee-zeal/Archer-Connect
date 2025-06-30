import { createAction, props } from '@ngrx/store';

export const Error = createAction('[Dashboard] Error Message', props<{ error: any }>());

export const GotoDocumentsList = createAction('[Dashboard] Go to Documents List');

export const GotoPersonDetials = createAction('[Dashboard] Go to Person Detials', props<{ personId: number }>());
export const GotoPersonsList = createAction('[Dashboard] Go to Persons List');
