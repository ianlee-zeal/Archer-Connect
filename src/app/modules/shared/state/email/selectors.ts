import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SharedModuleState, FEATURE_NAME } from '../shared.state';
import { EmailState } from './reducer';

const sharedFeature = createFeatureSelector<SharedModuleState>(FEATURE_NAME);
const emailSelector = createSelector(sharedFeature, (state: SharedModuleState) => state.emailState);

export const emailSelectors = {
  primaryEmail: createSelector(emailSelector, (state: EmailState) => state.primaryEmail),
};
