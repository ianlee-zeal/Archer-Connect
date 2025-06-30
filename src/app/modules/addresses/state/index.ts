import * as fromRoot from '@app/state';
import { AddressState } from './shared.state';

import { addAddressModalSelectors } from '../add-address-modal/state/selectors';
import { addressesListSelectors } from '../address-list/state/selectors';
import { addressVerificationModalSelectors } from '../add-address-modal/address-verification-modal/state/selectors';

import * as addAddressActions from '../add-address-modal/state/actions';
import * as addressesListActions from '../address-list/state/actions';
import * as addressVerificationActions from '../add-address-modal/address-verification-modal/state/actions';

// Extends the app state to include the product feature.
// This is required because products are lazy loaded.
// So the reference to ProductState cannot be added to app.state.ts directly.
export interface AppState extends fromRoot.AppState {
  address_feature: AddressState,
}

export const sharedSelectors = {
  addAddressModalSelectors,
  addressVerificationModalSelectors,
  addressesListSelectors,
};

export const sharedActions = {
  addAddressActions,
  addressesListActions,
  addressVerificationActions
};
