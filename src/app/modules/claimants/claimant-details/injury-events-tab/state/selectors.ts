import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IInjuryEventsListState } from './reducer';

const selectFeature = createFeatureSelector<IInjuryEventsListState>('claimant_injury_events_feature');
const injuryEvents = createSelector(selectFeature, state => state.injuryEvents);
const agGridParams = createSelector(selectFeature, state => state.agGridParams);

export const injuryEventListSelectors = {
  injuryEvents,
  agGridParams,
};
