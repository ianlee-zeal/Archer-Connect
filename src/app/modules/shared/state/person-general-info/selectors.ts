import { createSelector, createFeatureSelector } from '@ngrx/store';

import { ClaimantDetailsState } from '@app/modules/claimants/claimant-details/state/reducer';
import { FEATURE_NAME, SharedModuleState } from '../shared.state';

const sharedFeature = createFeatureSelector<SharedModuleState>(FEATURE_NAME);
const personGeneralInfoSelector = createSelector(sharedFeature, state => state.personGeneralInfo);
const claimanDetailsFeature = createFeatureSelector<ClaimantDetailsState>('claimant_details_feature');

export const personGeneralInfoSelectors = {
  person: createSelector(personGeneralInfoSelector, state => state.person),
  personDetailsHeader: createSelector(personGeneralInfoSelector, state => state.personDetailsHeader),
  isFullSsnLoaded: createSelector(personGeneralInfoSelector, state => state.isFullSsnLoaded),
  isFullOtherIdentifierLoaded: createSelector(personGeneralInfoSelector, state => state.isFullOtherIdentifierLoaded),
  isPersonValid: createSelector(personGeneralInfoSelector, state => state.isPersonValid),
  prevPersonId: createSelector(personGeneralInfoSelector, state => state.prevPersonId),
  actionBar: createSelector(personGeneralInfoSelector, state => state.actionBar),
  error: createSelector(personGeneralInfoSelector, state => state.error),
  claimain_details_item: createSelector(claimanDetailsFeature, state => state.item),
};
