import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AddressState, FEATURE_NAME } from '../../state/shared.state';

const addressFeature = createFeatureSelector<AddressState>(FEATURE_NAME);
const addressesListSelector = createSelector(addressFeature, state => state.addressesList);
const addressesList = createSelector(addressesListSelector, state => state.addresses);

export const addressesListSelectors = {
  entireState: addressesListSelector,
  searchParams: createSelector(addressesListSelector, state => state.searchParams),
  addressesList,
  address: createSelector(addressesList, (state, props) => state.find(address => address.id === props.id)),
  actionBar: createSelector(addressesListSelector, state => state.actionBar),
};
