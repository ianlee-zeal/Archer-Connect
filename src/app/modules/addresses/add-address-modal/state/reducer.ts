import { createReducer, on, Action } from '@ngrx/store';

import { EntityAddress } from '@app/models';
import * as addAddressActions from './actions';

export interface AddAddressModalState {
  pending: boolean,
  address: EntityAddress,
  isAddressFormValid: boolean,
  isPristineAddressForm: boolean,
  canEdit: boolean,
  canRunMoveCheck: boolean,
  showAddresseeAndAttnTo: boolean,
}

export const initialState: AddAddressModalState = {
  pending: false,
  address: {} as EntityAddress,
  isAddressFormValid: false,
  isPristineAddressForm: true,
  canEdit: false,
  canRunMoveCheck: false,
  showAddresseeAndAttnTo: false,
};

// main reducer function
const addAddressModalReducer = createReducer(
  initialState,
  on(addAddressActions.ChangeAddress, (state, { address, isAddressFormValid, isPristineAddressForm }) => ({ ...state, address, isAddressFormValid, isPristineAddressForm })),
  on(addAddressActions.ChangeAddressFormValidators, (state, { isAddressFormValid, isPristineAddressForm }) => ({ ...state, isAddressFormValid, isPristineAddressForm })),
  on(addAddressActions.ResetAddress, state => ({ ...state, address: null, isAddressValid: false, error: null })),
  on(addAddressActions.OpenAddressModal, (state, { canEdit, canRunMoveCheck, showAddresseeAndAttnTo }) => ({ ...state, canEdit, canRunMoveCheck, showAddresseeAndAttnTo })),
  on(addAddressActions.SetAddress, (state, { address, canEdit, canRunMoveCheck }) => ({ ...state, address, canEdit, canRunMoveCheck })),
);

// we have to wrap our reducer like this or it won't compile in prod
export function AddAddressModalReducer(state: AddAddressModalState | undefined, action: Action) {
  return addAddressModalReducer(state, action);
}
