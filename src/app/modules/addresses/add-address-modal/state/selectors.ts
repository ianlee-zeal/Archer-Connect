import { createSelector, createFeatureSelector } from '@ngrx/store';

import { FEATURE_NAME, AddressState } from '../../state/shared.state';

const addressFeature = createFeatureSelector<AddressState>(FEATURE_NAME);
const addAddressModalSelector = createSelector(addressFeature, state => state.addAddressModal);

export const addAddressModalSelectors = {
  address: createSelector(addAddressModalSelector, state => state.address),
  isAddressFormValid: createSelector(addAddressModalSelector, state => state.isAddressFormValid),
  isPristineAddressForm: createSelector(addAddressModalSelector, state => state.isPristineAddressForm),
  pending: createSelector(addAddressModalSelector, state => state.pending),
  canEdit: createSelector(addAddressModalSelector, state => state.canEdit),
  canRunMoveCheck: createSelector(addAddressModalSelector, state => state.canRunMoveCheck),
};
