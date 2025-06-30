import { createFeatureSelector, createSelector } from '@ngrx/store';

import { DocumentBatchState } from './reducer';

const featureSelector = createFeatureSelector<DocumentBatchState>('document_batch_feature');

export const documentBatchUploadSettings = createSelector(
  featureSelector,
  state => {
    return state.documentBatchUploadSettings;
  }
);

export const documentBatchList = createSelector(
  featureSelector,
  (state: DocumentBatchState) => state.documentBatchList
);
export const agGridParams = createSelector(
  featureSelector,
  (state: DocumentBatchState) => state.agGridParams
);

export const createdBatchId = createSelector(
  featureSelector,
  (state: DocumentBatchState) => state.createdBatchId
);

export const projectOptions = createSelector(
  featureSelector,
  (state: DocumentBatchState) => state.projectOptions,
);
export const projectOptionsLoading = createSelector(
  featureSelector,
  (state: DocumentBatchState) => state.projectOptionsLoading,
);

export const documentUploadTask = createSelector(
  featureSelector,
  (state: DocumentBatchState) => state.uploadTask
);

export const actionBar = createSelector(
  featureSelector, state => state.actionBar
);

export const getBatchDetails = createSelector(
  featureSelector, state => state.batchDetailsResponse
);


export const isCancelled = createSelector(
  featureSelector,
  (state: DocumentBatchState) => state.isCancelled
);

export const cancelUploadSucceeded = createSelector(
  featureSelector,
  (state: DocumentBatchState) => state.cancelUploadSucceeded
);

export const statusTypes = createSelector(
  featureSelector,
  (state: DocumentBatchState) => state.statusTypes
);

export const uploadTaskHasError = createSelector(
  featureSelector,
  (state: DocumentBatchState) => state.uploadTaskHasError
);

