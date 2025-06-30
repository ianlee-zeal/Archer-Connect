import { SelectHelper } from '@app/helpers/select.helper';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as PaymentsReducer from './reducer';

const selectFeature = createFeatureSelector<PaymentsReducer.PaymentsState>('payments');
const common = createSelector(selectFeature, state => state.common);

export const index = createSelector(common, state => state.index);
export const subOrganizations = createSelector(common, state => SelectHelper.toOptions(state.subOrganizations, o => o.id, o => o.name));
export const bankAccounts = createSelector(common, state => SelectHelper.toOptions(state.bankAccounts, o => o.id, o => o.name));
export const item = createSelector(common, state => state.item);
export const checkVerificationCount = createSelector(common, state => state.checkVerificationCount);
export const stopPaymentRequest = createSelector(common, state => state.stopPaymentRequest);
export const stopPaymentRequestDropdownValues = createSelector(common, state => state.stopPaymentRequestData);
export const error = createSelector(common, state => state.error);
export const params = createSelector(common, state => state.params);
export const actionBar = createSelector(common, state => state.actionBar);
export const advancedSearch = createSelector(selectFeature, state => state.advancedSearch);
export const checkVerification = createSelector(common, state => state.checkVerification);
