import { createReducer, on, Action } from '@ngrx/store';

import * as documentBatchActions from './actions';
import { DocumentBatchUploadSettings } from '@app/models/document-batch-upload/document-batch-upload-settings/document-batch-upload-settings';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { UploadTask } from '@app/models/document-batch-upload/upload-batch/upload-task';
import { FinalizeBatch } from '@app/models/enums/document-batch/finalize-batch';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { DocumentBatch } from '@app/models/document-batch-upload/document-batch';
import { UploadFileResponse } from '@app/models/document-batch-upload/upload-batch/upload-file-response';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { DocumentBatchDetailsResponse } from '@app/models/document-batch-get/get-single-batch/document-batch-details-response';

export interface DocumentBatchState {
  documentBatchUploadSettings: DocumentBatchUploadSettings | null;
  pending: boolean;
  documentBatchList: DocumentBatch[];
  agGridParams: IServerSideGetRowsParamsExtended;
  uploadTask: UploadTask | null;
  uploadError: string | null;
  uploadTaskHasError: boolean;
  createdBatchId: number | null;
  projectOptions: SelectOption[] | null;
  projectOptionsLoading: boolean;
  isCancelled: boolean;
  cancelUploadSucceeded: boolean;
  statusTypes: SelectOption[];
  error: string | null;
  actionBar: ActionHandlersMap,
  batchDetailsResponse: DocumentBatchDetailsResponse,
}

const initialState: DocumentBatchState = {
  documentBatchUploadSettings: new DocumentBatchUploadSettings({
    allowedFileExtensions: [],
    maxNumFiles: 0,
    maxFileSizeInBytes: 0,
    departments: [],
  }),
  documentBatchList: null,
  agGridParams: null,
  pending: false,
  uploadTask: null,
  uploadError: null,
  uploadTaskHasError: false,
  createdBatchId: null,
  projectOptions: [],
  projectOptionsLoading: false,
  isCancelled: false,
  cancelUploadSucceeded: false,
  statusTypes: [],
  error: null,
  actionBar: null,
  batchDetailsResponse: null
};

function updateUploadTaskForFailure(state: DocumentBatchState): DocumentBatchState {
  return {
    ...state,
    uploadTask: {
      ...state.uploadTask,
      isUploading: false,
    },
  };
}

function updateUploadTaskForSuccess(state: DocumentBatchState, response: UploadFileResponse): DocumentBatchState {
  const shouldContinueUploading = !state.isCancelled && response.status === FinalizeBatch.pending;
  const emptyResponse = response.documentId === undefined;

  const updatedState = {
    ...state,
    uploadTask: {
      ...state.uploadTask,
      isUploading: shouldContinueUploading,
      totalUploaded: state.uploadTask.totalUploaded + 1,

    },
    uploadTaskHasError: emptyResponse && !state.isCancelled,
  };

  return updatedState;
}

function createUploadTask(totalFiles: number, batchId: number): UploadTask {
  return {
    batchId,
    totalFiles,
    totalUploaded: 0,
    totalFailed: 0,
    isUploading: true,
  };
}

export const documentBatchReducer = createReducer(
  initialState,
  on(documentBatchActions.UpdateActionBar, (state, { actionBar }) => ({ ...state, actionBar })),
  on(documentBatchActions.GetBatchDetailsSuccess, (state, { response }) => (
    { ...state, batchDetailsResponse: response }
  )),
  on(documentBatchActions.getDocumentBatchUploadSettingsSuccess, (state, { settings }) => (
    { ...state, documentBatchUploadSettings: settings }
  )),

  //search batches
  on(documentBatchActions.searchBatches, (state, { agGridParams }) => ({
    ...state,
    pending: true,
    documentBatchList: null,
    agGridParams,
  })),
  on(documentBatchActions.searchBatchesSuccess, (state, { documentBatches }) => ({
    ...state,
    documentBatchList: documentBatches,
    pending: false,
  })),
  on(documentBatchActions.searchBatchesFailure, (state, { errorMessage, agGridParams }) => ({
    ...state,
    agGridParams: agGridParams,
    error: errorMessage,
    pending: false,
  })),

  //upload files
  on(documentBatchActions.createUploadTask, (state, { files, batchId }) => {
    return {
      ...state,
      uploadTask: createUploadTask(files.length, batchId),
    }
  }),
  on(documentBatchActions.uploadFileSuccess, (state, { response }) => {
    return updateUploadTaskForSuccess(state, response);
  }),
  on(documentBatchActions.uploadFileFailure, state => updateUploadTaskForFailure(state)),
  on(documentBatchActions.completeUploadTask, () => ({
    ...initialState,
  })),

  //cancel batch
  on(documentBatchActions.cancelUploadRequest, state => {
    return {
      ...state,
      isCancelled: true,
    }
  }),
  on(documentBatchActions.cancelUploadTaskSuccess, state => {
    return {
      ...state,
      cancelUploadSucceeded: true,
    }
  }),

  //create batch
  on(documentBatchActions.createBatchSuccess, (state, { response }) => ({
    ...state,
    createdBatchId: response.id,
    error: null,
  })),
  on(documentBatchActions.createBatchFailure, (state, { error }) => ({
    ...state,
    error: error,
  })),

  //project options
  on(documentBatchActions.GetProjectOptionsRequest, state => ({
    ...state, projectOptionsLoading: true,
  })),
  on(documentBatchActions.GetProjectOptionsError, state => ({
    ...state, projectOptionsLoading: false,
  })),
  on(documentBatchActions.GetProjectOptionsSuccess, (state, { projectOptions }) => {
    return {
      ...state,
      projectOptions: [...projectOptions],
      projectOptionsLoading: false,
    };
  }),

  //status types
  on(documentBatchActions.getStatusTypesSuccess, (state, { statusTypes }) => ({
    ...state,
    statusTypes: statusTypes,
  })),

  on(documentBatchActions.error, (state, { errorMessage }) => ({
    ...state,
    error: errorMessage,
    documentBatchUploadSettings: null,
  })),

  on(documentBatchActions.reset, () => ({
    ...initialState,
  })),
);

export function DocumentBatchReducer(
  state: DocumentBatchState | undefined,
  action: Action
) {
  return documentBatchReducer(state, action);
}
