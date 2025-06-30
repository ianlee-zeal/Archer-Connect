import { createSelector, createFeatureSelector } from '@ngrx/store';

import { FEATURE_NAME, AddressState } from '../../../state/shared.state';

const addressFeature = createFeatureSelector<AddressState>(FEATURE_NAME);
const addressVerificationModalSelector = createSelector(addressFeature, state => state.addressVerificationModal);

export const addressVerificationModalSelectors = {
  dropdownValues: createSelector(addressVerificationModalSelector, state => state.dropdownValues),
  error: createSelector(addressVerificationModalSelector, state => state.error),

  showVerify: createSelector(addressVerificationModalSelector, state => state.showVerify),
  verifyConfiguration: createSelector(addressVerificationModalSelector, state => state.verifyConfiguration),
  verifiedAddress: createSelector(addressVerificationModalSelector, state => state.verifiedAddress),
  useVerifiedAddress: createSelector(addressVerificationModalSelector, state => state.useVerifiedAddress),
  runVerify: createSelector(addressVerificationModalSelector, state => state.runVerify),

  showMoveCheck: createSelector(addressVerificationModalSelector, state => state.showMoveCheck),
  moveCheckConfiguration: createSelector(addressVerificationModalSelector, state => state.moveCheckConfiguration),
  moveCheckResults: createSelector(addressVerificationModalSelector, state => state.moveCheckResults),
  runMoveCheck: createSelector(addressVerificationModalSelector, state => state.runMoveCheck),
};
