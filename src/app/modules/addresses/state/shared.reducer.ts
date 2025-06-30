import { AddAddressModalReducer } from '../add-address-modal/state/reducer';
import { AddressesListReducer } from '../address-list/state/reducer';
import { AddressVerificationModalReducer } from '../add-address-modal/address-verification-modal/state/reducer';

export const sharedReducer = {
  addAddressModal: AddAddressModalReducer,
  addressesList: AddressesListReducer,
  addressVerificationModal: AddressVerificationModalReducer
};
