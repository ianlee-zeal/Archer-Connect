import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SharedModuleState, FEATURE_NAME } from '../shared.state';
import { DigitalPaymentState } from './reducer';

const sharedFeature = createFeatureSelector<SharedModuleState>(FEATURE_NAME);
const digitalProviderSelector = createSelector(sharedFeature, (state: SharedModuleState) => state.digitalPayment);

export const digitalPaymentSelectors = {
  digitalProviderStatusOptions: createSelector(digitalProviderSelector, (state: DigitalPaymentState) => state.digitalProviderStatuses),
};
