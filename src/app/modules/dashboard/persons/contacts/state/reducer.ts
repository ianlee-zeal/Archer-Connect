import { createReducer, on, Action } from '@ngrx/store';

import { Person, PersonContact } from '@app/models';
import * as actions from './actions';

export interface ContactState {
  error: any,
  pending: boolean,
  currentClaimantId: number;
  contacts: PersonContact[],
  contact: PersonContact,
  searchExistingPersonToContact: string,
  searchExistingPersonToContactResult: Person[],
  isFullSsnLoaded: boolean,
}

const initialState: ContactState = {
  error: null,
  pending: false,
  currentClaimantId: 0,
  contacts: null,
  contact: null,
  searchExistingPersonToContact: '',
  searchExistingPersonToContactResult: null,
  isFullSsnLoaded: false,
};

const contactsReducer = createReducer(
  initialState,

  on(actions.GetAllPersonContactsRequest, (state, { claimantId }) => ({ ...state, pending: true, error: null, contacts: null, currentClaimantId: claimantId })),
  on(actions.GetAllPersonContactsSuccess, (state, { contacts }) => ({ ...state, pending: false, error: null, contacts })),
  on(actions.Error, (state, { error }) => ({ ...state, error, pending: false })),
  on(actions.ResetStateError, state => ({ ...state, error: null })),

  on(actions.SearchExistingPersonToContact, (state, { searchTerm }) => ({ ...state, error: null, searchExistingPersonToContact: searchTerm })),
  on(actions.ResetSearchExistingPersonToContact, state => ({ ...state, error: null, searchExistingPersonToContact: '', selectedExistingPersonToContact: null, searchExistingPersonToContactResult: [] })),
  on(actions.SearchExistingPersonToContactComplete, (state, { persons }) => ({ ...state, error: null, searchExistingPersonToContactResult: persons })),

  on(actions.UpdateContactModel, (state, { contact }) => ({ ...state, contact: { ...state.contact, ...contact } })),
  on(actions.LinkPerson, (state, { person }) => ({ ...state, error: null, contact: { ...state.contact, person, isPrimaryContact: person?.isPrimaryContact } })),

  on(actions.GetPersonContact, (state, { clientContactId }) => ({ ...state, contact: null, contactId: clientContactId })),
  on(actions.GetPersonContactSuccess, (state, { contact }) => ({ ...state, error: null, contact })),
  on(actions.ResetPersonContact, state => ({ ...state, contact: null })),

  on(actions.GetPersonFullSSNComplete, (state, { fullSsn }) => ({ ...state, contact: { ...state.contact, person: { ...state.contact.person, ssn: fullSsn } }, isFullSsnLoaded: true })),
  on(actions.ResetPersonFullSSN, state => ({ ...state, isFullSsnLoaded: false })),
);

export function ContactsReducer(state: ContactState | undefined, action: Action) {
  return contactsReducer(state, action);
}
