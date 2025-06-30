import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SharedModuleState, FEATURE_NAME } from '../shared.state';

const sharedFeature = createFeatureSelector<SharedModuleState>(FEATURE_NAME);
const mfaCodeModalSelector = createSelector(sharedFeature, state => state.mfaCodeModal);

export const mfaCodeModalSelectors = {
  code: createSelector(mfaCodeModalSelector, state => state.code),
  phoneNumber: createSelector(mfaCodeModalSelector, state => state.phoneNumber),
};
