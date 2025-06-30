import { createFeatureSelector, createSelector } from '@ngrx/store';

import { SharedModuleState, FEATURE_NAME } from '../shared.state';

const sharedFeature = createFeatureSelector<SharedModuleState>(FEATURE_NAME);
const pusherChannelSelector = createSelector(sharedFeature, state => state.pusherChannel);

export const pusherChannelSelectors = {
  channels: createSelector(pusherChannelSelector, state => state.channels),
};
