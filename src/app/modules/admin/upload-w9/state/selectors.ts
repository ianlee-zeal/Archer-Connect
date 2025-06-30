import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromAdminR from '../../state/reducer';

const adminFeature = createFeatureSelector<fromAdminR.AdminState>('admin_feature');

const uploadState = createSelector(adminFeature, state => state.uploadw9);

export const selectIsUploading = createSelector(uploadState, state => state.uploading);
export const selectW9Settings = createSelector(uploadState, state => state.w9Settings);
export const selectValidationResult = createSelector(uploadState, state => state.result);
