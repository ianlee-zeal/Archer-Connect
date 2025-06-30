import { createAction, props } from '@ngrx/store';
import { DocumentValidationResult } from '@app/models/upload-w9/document-validation-result';

export const FEATURE_NAME = '[Admin-Upload-W9]';

export const UploadW9 = createAction(`${FEATURE_NAME} Upload W9`, props<{ file: File }>());
export const UploadW9Success = createAction(`${FEATURE_NAME} Upload W9 Success`, props<{ result: DocumentValidationResult }>());
export const UploadW9Error = createAction(`${FEATURE_NAME} Upload W9 Error`, props<{ errorMessage: string }>());

export const GetW9Settings = createAction(`${FEATURE_NAME} Get W9 Settings`);
export const GetW9SettingsSuccess = createAction(`${FEATURE_NAME} Get W9 Settings Success`, props<{ data: any }>());

export const Error = createAction(`${FEATURE_NAME} Error`, props<{ error: any }>());
