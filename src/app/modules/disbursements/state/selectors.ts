import { createSelector, createFeatureSelector } from '@ngrx/store';
import * as fromDisbursements from './reducer';

const featureSelector = createFeatureSelector<fromDisbursements.DisbursementState>('disbursements_feature');

const stateSelector = createSelector(featureSelector, state => state);

export const actionBar = createSelector(stateSelector, state => state.actionBar);

export const error = createSelector(stateSelector, state => state.error);
export const disbursements = createSelector(stateSelector, state => state.disbursements);
export const agGridParams = createSelector(stateSelector, state => state.agGridParams);

export const paymentRequestDetails = createSelector(stateSelector, state => state.paymentRequestDetails);
export const paymentRequestDetailsGridParams = createSelector(stateSelector, state => state.paymentRequestDetailsGridParams);
export const paymentRequestTotal = createSelector(stateSelector, state => state.paymentRequestTotal);

export const transferRequestDetails = createSelector(stateSelector, state => state.transferRequestDetails);
export const transferRequestDetailsGridParams = createSelector(stateSelector, state => state.transferRequestDetailsGridParams);
export const transferRequestTotal = createSelector(stateSelector, state => state.transferRequestTotal);

export const stopPaymentRequestGridParams = createSelector(stateSelector, state => state.stopPaymentRequestGridParams);

export const paymentRequestDetailsCounts = createSelector(stateSelector, state => state.paymentRequestDetailsCounts);
export const transferRequestDetailsCounts = createSelector(stateSelector, state => state.transferRequestDetailsCounts);
