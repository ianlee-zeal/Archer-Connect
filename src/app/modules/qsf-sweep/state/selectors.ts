import { createSelector, createFeatureSelector } from '@ngrx/store';
import * as reducer from './reducer';

const featureSelector = createFeatureSelector<reducer.QsfSweepState>('qsf_sweep_feature');

const stateSelector = createSelector(featureSelector, (state: reducer.QsfSweepState) => state);

export const error = createSelector(stateSelector, (state: reducer.QsfSweepState) => state.error);
export const isQsfSweepInProgress = createSelector(stateSelector, (state: reducer.QsfSweepState) => state.isQsfSweepInProgress);
export const statusData = createSelector(stateSelector, (state: reducer.QsfSweepState) => state.statusData);
export const qsfSweepBatch = createSelector(stateSelector, (state: reducer.QsfSweepState) => state.qsfSweepBatch);
export const isLoading = createSelector(stateSelector, (state: reducer.QsfSweepState) => state.isLoading);
export const qsfCommitChangesResponse = createSelector(stateSelector, (state: reducer.QsfSweepState) => state.qsfCommitChangesResponse);
