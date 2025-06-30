import { createReducer, on, Action } from '@ngrx/store';

import * as actions from './actions';
import { initialState, SharedPersonGeneralInfoState } from './state';

// main reducer function
const sharedPersonGeneralInfoReducer = createReducer(
  initialState,

  on(actions.PersonDetailsError, (state, { error }) => ({ ...state, pending: false, error })),
  on(actions.GetPersonDetails, state => ({ ...state, pending: true, error: null, person: null, personDetailsHeader: null, isPersonValid: false, isFullSsnLoaded: false })),
  on(actions.GetPersonDetailsComplete, (state, { person }) => ({ ...state, pending: false, person, personDetailsHeader: person })),

  on(actions.UpdatePersonDetails, (state, { person, isPersonValid }) => ({ ...state, person, isPersonValid })),

  on(actions.SaveUpdatedPerson, state => ({ ...state, error: null, pending: true })),
  on(actions.SaveUpdatedPersonComplete, (state, { updatedPerson }) => ({ ...state, pending: false, person: updatedPerson, personDetailsHeader: updatedPerson, isFullSsnLoaded: false })),

  on(actions.DeletePerson, state => ({ ...state, pending: true })),
  on(actions.DeletePersonComplete, state => ({ ...state, pending: false })),

  on(actions.UpdatePreviosPerson, (state, { prevPersonId }) => ({ ...state, prevPersonId })),
  on(actions.UpdatePersonDetailsActionBar, (state, { actionBar }) => ({ ...state, actionBar })),

  on(actions.GetPersonFullSSNComplete, (state, { fullSsn }) => ({ ...state, person: { ...state.person, ssn: fullSsn }, isFullSsnLoaded: true })),
  on(actions.ResetPersonFullSSN, state => ({ ...state, isFullSsnLoaded: false })),

  on(actions.GetPersonFullOtherIdentifierComplete, (state: SharedPersonGeneralInfoState, { otherIdentifier }) => ({ ...state, person: { ...state.person, otherIdentifier }, isFullOtherIdentifierLoaded: true })),
  on(actions.ResetPersonFullOtherIdentifier, (state: SharedPersonGeneralInfoState) => ({ ...state, isFullOtherIdentifierLoaded: false })),
);

// we have to wrap our reducer like this or it won't compile in prod
export function SharedPersonGeneralInfoReducer(state: SharedPersonGeneralInfoState | undefined, action: Action) {
  return sharedPersonGeneralInfoReducer(state, action);
}
