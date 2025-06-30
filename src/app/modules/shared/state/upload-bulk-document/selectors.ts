/* eslint-disable import/no-cycle */
import { createFeatureSelector, createSelector } from '@ngrx/store';

import { SharedModuleState, FEATURE_NAME } from '../shared.state';

const sharedFeature = createFeatureSelector<SharedModuleState>(FEATURE_NAME);
const uploadBulkDocumentSelector = createSelector(sharedFeature, state => state.uploadBulkDocument);

export const uploadBulkDocumentSelectors = {
  error: createSelector(uploadBulkDocumentSelector, state => state.error),
  documentImport: createSelector(uploadBulkDocumentSelector, state => state.documentImport),
  isValidSelect: createSelector(uploadBulkDocumentSelector, state => state.isValidSelect),
  isValidGroupSelect: createSelector(uploadBulkDocumentSelector, state => state.isValidGroupSelect),
  isValidConfigure: createSelector(uploadBulkDocumentSelector, state => state.isValidConfigure),
  isValidUpload: createSelector(uploadBulkDocumentSelector, state => state.isValidUpload),
  data: createSelector(uploadBulkDocumentSelector, state => state.data),
  updateProgress: createSelector(uploadBulkDocumentSelector, state => state.updateProgress),
  previewFileRows: createSelector(uploadBulkDocumentSelector, state => state.previewFileRows),
  stage: createSelector(uploadBulkDocumentSelector, state => state.stage),
  isValidationInProgress: createSelector(uploadBulkDocumentSelector, state => state.isValidationInProgress),
  isProcessingInProgress: createSelector(uploadBulkDocumentSelector, state => state.isProcessingInProgress),
  isApproved: createSelector(uploadBulkDocumentSelector, state => state.isApproved),
  selectedTemplate: createSelector(uploadBulkDocumentSelector, state => state.selectedTemplate),
  reviewGrids: createSelector(uploadBulkDocumentSelector, state => state.reviewGrids),
  allRecords: createSelector(uploadBulkDocumentSelector, state => state.reviewGrids.allRecords.validationResults),
  disbursementGroups: createSelector(uploadBulkDocumentSelector, state => state.disbursementGroups),
  projectFirmsOptions: createSelector(uploadBulkDocumentSelector, state => state.projectFirmsOptions),
  progressValues: createSelector(uploadBulkDocumentSelector, state => state.progressValues),
  previewTotalPayment: createSelector(uploadBulkDocumentSelector, state => state.previewTotalPayment),
};
