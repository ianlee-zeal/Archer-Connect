import { AddAddressModalEffects } from '../add-address-modal/state/effects';
import { AddressesListEffects } from '../address-list/state/effects';
import { AddressVerificationModalEffects } from '../add-address-modal/address-verification-modal/state/effects';

export const sharedEffects: any[] = [
  AddAddressModalEffects,
  AddressesListEffects,
  AddressVerificationModalEffects,
];
