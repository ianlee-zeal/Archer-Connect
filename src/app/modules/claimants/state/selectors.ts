import { createFeatureSelector, createSelector } from '@ngrx/store';

import { ClaimantsState } from './reducer';

const selectFeature = createFeatureSelector<ClaimantsState>('claimants_feature');
export const gridParamsRequest = createSelector(selectFeature, state => state.gridParamsRequest);
export const actionBar = createSelector(selectFeature, state => state.actionBar);

export const missingDocsOptions = createSelector(selectFeature, state => state.missingDocsOptions);
export const docsToSendOptions = createSelector(selectFeature, state => state.docsToSendOptions);
export const allDocuments = createSelector(selectFeature, state => state.allDocuments);
