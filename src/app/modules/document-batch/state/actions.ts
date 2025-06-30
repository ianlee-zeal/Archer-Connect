import { createAction, props } from '@ngrx/store';

import { DocumentBatchUploadSettings } from '@app/models/document-batch-upload/document-batch-upload-settings/document-batch-upload-settings';
import { UploadFileResponse } from '@app/models/document-batch-upload/upload-batch/upload-file-response';
import { CreateBatchRequest } from '@app/models/document-batch-upload/create-batch/create-batch-request';
import { CreateBatchResponse } from '@app/models/document-batch-upload/create-batch/create-batch-response';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { DocumentBatch } from '@app/models/document-batch-upload/document-batch';
import { NavigationSettings } from '@app/modules/shared/action-bar/navigation-settings';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { DocumentBatchDetailsResponse } from '@app/models/document-batch-get/get-single-batch/document-batch-details-response';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

const featureName = '[document_batch_feature]';

export const error = createAction(`${featureName} Error`, props<{ errorMessage: string }>());

export const getDocumentBatchUploadSettings = createAction(`${featureName} Request Document Batch Upload Settings`);
export const getDocumentBatchUploadSettingsSuccess = createAction(`${featureName} Get Document Batch Upload Settings Success`, props<{ settings: DocumentBatchUploadSettings }>());

export const searchBatches = createAction(`${featureName} Get Document Batches`, props<{ agGridParams: IServerSideGetRowsParamsExtended }>());
export const searchBatchesSuccess = createAction(`${featureName} Search Batches Success`, props<{ documentBatches: DocumentBatch[], agGridParams:IServerSideGetRowsParamsExtended, totalRecords:number }>());
export const searchBatchesFailure = createAction(`${featureName} Search Batches Failure`, props <{ errorMessage: string, agGridParams: IServerSideGetRowsParamsExtended }>());

export const createUploadTask = createAction(`${featureName} Create Upload Task`, props<{ files: File[], batchId: number }>());
export const uploadFile = createAction(`${featureName} Upload File`,props<{ file: File, batchId: number, isFinal: boolean }>());
export const uploadFileSuccess = createAction(`${featureName} Upload File Success`,props<{ response: UploadFileResponse }>());
export const uploadFileFailure = createAction(`${featureName} Upload File Failure`,props<{ error: any }>());
export const completeUploadTask = createAction(`${featureName} Complete Upload Task`);

export const cancelUploadRequest = createAction(`${featureName} Cancel Upload Task`, props<{ batchId: number }>());
export const cancelUploadTaskSuccess = createAction(`${featureName} Cancel Upload Task Success`);
export const cancelUploadTaskFailure = createAction(`${featureName} Cancel Upload Task Failure`,props<{ error: any }>());

export const createBatch = createAction(`${featureName} Create Batch`,props<{ createBatchRequest: CreateBatchRequest }>());
export const createBatchSuccess = createAction(`${featureName} Create Batch Success`,props<{ response: CreateBatchResponse }>());
export const createBatchFailure = createAction(`${featureName} Create Batch Failure`,props<{ error: any }>());

export const GetProjectOptionsRequest = createAction(`${featureName} Get Project Options Request`, props<{ search?: IServerSideGetRowsRequestExtended }>());
export const GetProjectOptionsSuccess = createAction(`${featureName} Get Project Options Complete`, props<{ projectOptions: SelectOption[] }>());
export const GetProjectOptionsError = createAction(`${featureName} Get Project Options Error`, props<{ error: any }>());

export const getStatusTypes = createAction(`${featureName} Get Status Types`);
export const getStatusTypesSuccess = createAction(`${featureName} Get Status Types Success`, props<{ statusTypes: SelectOption[] }>());

export const GoToBatchDetails = createAction(`${featureName} Go to Batch Details Page`, props<{  batchId: number, navSettings: NavigationSettings }>());
export const GetBatchDetails = createAction(`${featureName} Get Batch Details`, props<{ batchId: number }>());
export const GetBatchDetailsSuccess = createAction(`${featureName} Get Batch Details Success`, props<{ response: DocumentBatchDetailsResponse }>());
export const GetBatchDetailsFailure = createAction(`${featureName} Get Batch Details Failure`, props<{ error: any }>());
export const GetBatchDetailsLoadingStarted = createAction('Get Batch Details Loading Started', props<{ additionalActionNames: string[] }>());

export const reset = createAction(`${featureName} Reset`);

export const UpdateActionBar = createAction(`${featureName} Update Action Bar`, props<{ actionBar: ActionHandlersMap }>());
