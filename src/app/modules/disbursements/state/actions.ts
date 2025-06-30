import { PaymentGridRecordLight, PaymentRequestDetails, PaymentRequestSummary, PaymentRequestTotalInfo } from '@app/models';
import { SaveDocumentGeneratorRequest } from '@app/models/documents';
import { StartGeneratePaymentDocumentsJobRequest } from '@app/models/documents/document-generators';
import { TransferRequestDetails } from '@app/models'
import { TransferRequestSummary } from '@app/models'
import { TransferRequestTotalInfo } from '@app/models'
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

export const FEATURE_NAME = '[Disbursements]';

export const Error = createAction(`${FEATURE_NAME} API Error`, props<{ errorMessage: string }>());

export const UpdateActionBar = createAction(`${FEATURE_NAME} Update Action Bar`, props<{ actionBar: ActionHandlersMap }>());

export const GetStopPaymentRequestList = createAction(`${FEATURE_NAME} Search Stop Payment Request`, props<{ agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetStopPaymentRequestListComplete = createAction(`${FEATURE_NAME} Search Stop Payment Request Complete`, props<{ stopPaymentRequestList: PaymentGridRecordLight[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());

export const GetDisbursementsList = createAction(`${FEATURE_NAME} Get List`, props<{ agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetDisbursementsListComplete = createAction(`${FEATURE_NAME} Get List Complete`, props<{ disbursements: PaymentRequestSummary[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const GetDisbursementsListError = createAction(`${FEATURE_NAME} Get List Error`, props<{ errorMessage: string, agGridParams: IServerSideGetRowsParamsExtended }>());

export const GetPaymentRequestDetails = createAction(`${FEATURE_NAME} Get Payment Request Details`, props<{ paymentRequestId: number, agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetPaymentRequestDetailsComplete = createAction(`${FEATURE_NAME} Get Payment Request Details Complete`, props<{ paymentRequestDetails: PaymentRequestDetails[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());

export const GetPaymentRequestTotal = createAction(`${FEATURE_NAME} Get Payment Request Total Info`, props<{ paymentRequestId: number }>());
export const GetPaymentRequestTotalComplete = createAction(`${FEATURE_NAME} Get Payment Request Total Info Complete`, props<{ paymentRequestTotal: PaymentRequestTotalInfo }>());

export const GetTransferRequestsList = createAction(`${FEATURE_NAME} Get Transfer Requests List`, props<{ agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetTransferRequestsListComplete = createAction(`${FEATURE_NAME} Get Transfer Requests List Complete`, props<{ transferRequests: TransferRequestSummary[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const GetTransferRequestsListError = createAction(`${FEATURE_NAME} Get Transfer Requests List Error`, props<{ errorMessage: string, agGridParams: IServerSideGetRowsParamsExtended }>());

export const GetTransferRequestDetails = createAction(`${FEATURE_NAME} Get Transfer Request Details`, props<{ transferRequestId: number, agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetTransferRequestDetailsComplete = createAction(`${FEATURE_NAME} Get Transfer Request Details Complete`, props<{ transferRequestDetails: TransferRequestDetails[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());

export const GetTransferRequestTotal = createAction(`${FEATURE_NAME} Get Transfer Request Total Info`, props<{ transferRequestId: number }>());
export const GetTransferRequestTotalComplete = createAction(`${FEATURE_NAME} Get Transfer Request Total Info Complete`, props<{ transferRequestTotal: TransferRequestTotalInfo }>());

export const LoadTemplates = createAction(`${FEATURE_NAME} Load Templates`, props<{ entityTypeId: number, documentTypes: number[] }>());
export const LoadTemplatesComplete = createAction(`${FEATURE_NAME} Load Templates Complete`, props<{ data: any }>());

export const GenerateExtract = createAction(`${FEATURE_NAME} Generate Extract`, props<{ paymentRequestId: number, generationRequest: SaveDocumentGeneratorRequest, isManual: boolean }>());
export const GenerateExtractComplete = createAction(`${FEATURE_NAME} Generate Extract Complete`, props<{ generationRequest: SaveDocumentGeneratorRequest }>());

export const DownloadDocument = createAction(`${FEATURE_NAME} Download Document`, props<{ generatorId: number }>());
export const DownloadDocumentComplete = createAction(`${FEATURE_NAME} Download Document Complete`);

export const DownloadPaymentExtract = createAction(`${FEATURE_NAME} Download Payment Extract Document`, props<{ generatorId: number, paymentRequestId: number }>());
export const DownloadPaymentExtractComplete = createAction(`${FEATURE_NAME} Download Payment Extract Document Complete`);

export const StartGeneratePaymentDocumentsJob = createAction(`${FEATURE_NAME} Start Generate Payment Documents Job`, props<{ request: StartGeneratePaymentDocumentsJobRequest }>());
export const StartGeneratePaymentDocumentsJobComplete = createAction(`${FEATURE_NAME} Start Generate Payment Documents Job Complete`, props<{ paymentId: number }>());
export const StartGeneratePaymentDocumentsJobError = createAction(`${FEATURE_NAME} Start Generate Payment Documents Job Error`, props<{ errorMessage: string, paymentId: number }>());

export const DownloadAttachments = createAction(`${FEATURE_NAME} Payment Request Download Attachments`, props<{ id: number }>());

export const GetPaymentRequestVoidCounts = createAction(`${FEATURE_NAME} Get Payment Request Void Counts`, props<{ paymentRequestId: number }>());
export const GetPaymentRequestVoidCountsComplete = createAction(`${FEATURE_NAME} Get Payment Request Void Counts Complete`, props<{ voidedItems: number, otherItems: number }>());
export const ResetPaymentRequestVoidCounts = createAction(`${FEATURE_NAME} Reset Payment Request Void Counts`);

export const StartGenerateTransferDocumentsJob = createAction(`${FEATURE_NAME} Start Generate Transfer Documents Job`, props<{ request: StartGeneratePaymentDocumentsJobRequest }>());
export const StartGenerateTransferocumentsJobComplete = createAction(`${FEATURE_NAME} Start Generate Transfer Documents Job Complete`, props<{ transferRequestId: number }>());
export const StartGenerateTransferDocumentsJobError = createAction(`${FEATURE_NAME} Start Generate Transfer Documents Job Error`, props<{ errorMessage: string, paymentId: number }>());


export const DownloadTransferExtract = createAction(`${FEATURE_NAME} Download Transfer Extract Document`, props<{ generatorId: number, transferRequestId: number }>());
export const DownloadTransferExtractComplete = createAction(`${FEATURE_NAME} Download Transfer Extract Document Complete`);

export const GetTransferRequestVoidCounts = createAction(`${FEATURE_NAME} Get Transfer Request Void Counts`, props<{ transferRequestId: number }>());
export const GetTransferRequestVoidCountsComplete = createAction(`${FEATURE_NAME} Get Transfer Request Void Counts Complete`, props<{ voidedItems: number, otherItems: number }>());
export const ResetTransferRequestVoidCounts = createAction(`${FEATURE_NAME} Reset Transfer Request Void Counts`);

export const GenerateTransferExtract = createAction(`${FEATURE_NAME} Generate Transfer Extract`, props<{ transferRequestId: number, generationRequest: SaveDocumentGeneratorRequest, batchActionTemplateId: number }>());
export const GenerateTransferExtractComplete = createAction(`${FEATURE_NAME} Generate Transfer Extract Complete`, props<{  generationRequest: SaveDocumentGeneratorRequest }>());

export const DownloadTransferAttachments = createAction(`${FEATURE_NAME} Transfer Request Download Attachments`, props<{ id: number }>());
