import { createReducer, on, Action } from '@ngrx/store';

import * as addressesListActions from './actions';
import { EntityAddress } from '../../../../models/entity-address';
import { ActionHandlersMap } from '../../../shared/action-bar/action-handlers-map';
import * as addressModalActions from '../../add-address-modal/state/actions';

export interface AddressesListState {
  error: any,
  pending: boolean,
  searchParams: addressesListActions.AddressesListSearchParams,
  addresses: EntityAddress[],
  actionBar: ActionHandlersMap,
}

const initialState: AddressesListState = {
  error: null,
  pending: false,
  searchParams: {
    entityId: null,
    entityType: null,
  },
  addresses: null,
  actionBar: null,
};

// main reducer function
const addressesListReducer = createReducer(
  initialState,
  on(addressesListActions.GetAddressesList, (state, { searchParams }) => ({ ...state, pending: true, error: null, addresses: null, searchParams, selectedAddresses: [] })),

  on(addressesListActions.GetAddressesListError, (state, { errorMessage }) => ({ ...state, pending: false, error: errorMessage })),

  on(addressesListActions.GetAddressesListComplete, (state, { addresses }) => ({ ...state, addresses, error: null })),

  on(addressesListActions.UpdateAddressesListActionBar, (state, { actionBar }) => ({ ...state, actionBar })),

  on(addressModalActions.DeleteAddressSuccess, (state, { addressId }) => ({ ...state, addresses: state.addresses.filter(a => a.id !== addressId) })),
);

// we have to wrap our reducer like this or it won't compile in prod
export function AddressesListReducer(state: AddressesListState | undefined, action: Action) {
  return addressesListReducer(state, action);
}
