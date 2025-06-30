import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromContacts from './reducer';

const featureSelector = createFeatureSelector<fromContacts.ContactState>('contacts_feature');

export const error = createSelector(featureSelector, state => state.error);
export const personContactListSelector = createSelector(featureSelector, state => state.contacts);
export const personContactPaidOnBehalfListSelector = createSelector(featureSelector, state => state.contacts?.filter(p => p.isPaidOnBehalfOfClaimant));
export const personContactSelector = createSelector(featureSelector, state => state.contact);
export const currentClaimantIdSelector = createSelector(featureSelector, state => state.currentClaimantId);

export const isFullSsnLoaded = createSelector(featureSelector, state => state.isFullSsnLoaded);

export const searchExistingPersonToContact = createSelector(featureSelector, state => state.searchExistingPersonToContact);
export const searchExistingPersonToContactResult = createSelector(featureSelector, state => state.searchExistingPersonToContactResult);
