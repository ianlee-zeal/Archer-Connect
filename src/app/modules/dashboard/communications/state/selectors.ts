import { createSelector, createFeatureSelector } from '@ngrx/store';
import * as globalCommunicationSearch from './reducer';

const featureSelector = createFeatureSelector<globalCommunicationSearch.GlobalCommunicationSearchState>('global-communication-search_feature');

const common = createSelector(featureSelector, state => state.common);

export const error = createSelector(common, state => state.error);
export const actionBar = createSelector(common, state => state.actionBar);
export const agGridParams = createSelector(common, state => state.agGridParams);
