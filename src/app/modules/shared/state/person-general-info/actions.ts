import { createAction, props } from '@ngrx/store';

import { Person } from '@app/models/person';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { ApiErrorResponse } from '@app/models/api-error-response';

const featureName = '[Person Details]';

export const PersonDetailsError = createAction(`${featureName} API Error`, props<{ error: string | ApiErrorResponse }>());
export const GetPersonDetails = createAction(`${featureName} Get Person`, props<{ id: number }>());
export const GetPersonDetailsComplete = createAction(`${featureName} Get Person Complete`, props<{ person: Person }>());
export const UpdatePersonDetails = createAction(`${featureName} Update Person`, props<{ person: Person, isPersonValid: boolean }>());
export const SaveUpdatedPerson = createAction(`${featureName} Save Person`, props<{ person: Person, callback:() => void }>());
export const SaveUpdatedPersonComplete = createAction(`${featureName} Save Person Complete`, props<{ updatedPerson: Person }>());
export const DeletePerson = createAction(`${featureName} Delete Person`, props<{ personId: number, callback:() => void }>());
export const DeletePersonComplete = createAction(`${featureName} Delete Person Complete`);
export const RefreshPerson = createAction(`${featureName} Refresh Person`);
export const UpdatePreviosPerson = createAction(`${featureName} Update Previos Person Id`, props<{ prevPersonId: number }>());
export const UpdatePersonDetailsActionBar = createAction(`${featureName} Update Person Details Action Bar`, props<{ actionBar: ActionHandlersMap }>());
export const GoToPersons = createAction(`${featureName} Go To Persons`);
export const GetPersonLoadingStarted = createAction(`${featureName} Get Person Loading Started`);

export const GetPersonFullSSN = createAction(`${featureName} Get Person Full SSN`, props<{ personId: number }>());
export const GetPersonFullSSNComplete = createAction(`${featureName} Get Person Full SSN Complete`, props<{ fullSsn: string }>());

export const ResetPersonFullSSN = createAction(`${featureName} Reset Person Full SSN`);

export const GetPersonFullOtherIdentifier = createAction(`${featureName} Get Person Full Other Identifier`, props<{ personId: number }>());
export const GetPersonFullOtherIdentifierComplete = createAction(`${featureName} Get Person Full Other Identifier Complete`, props<{ otherIdentifier: string }>());

export const ResetPersonFullOtherIdentifier = createAction(`${featureName} Reset Person Other Identifier`);
