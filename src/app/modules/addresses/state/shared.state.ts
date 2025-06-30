import { AddressesListState } from '../address-list/state/reducer';
import { AddAddressModalState } from '../add-address-modal/state/reducer';
import { AddressVerificationModalState } from '../add-address-modal/address-verification-modal/state/reducer';

export const FEATURE_NAME = 'address_feature';

export interface AddressState {
  addAddressModal: AddAddressModalState,
  addressesList: AddressesListState,
  addressVerificationModal: AddressVerificationModalState
}
