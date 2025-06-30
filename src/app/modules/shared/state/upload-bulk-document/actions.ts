import { createAction, props } from '@ngrx/store';

import { DocumentImport, DocumentImportTemplate } from '@app/models/documents';
import { FileImportDocumentType, FileImportResultStatus, FileImportReviewTabs, UploadBulkDocumentStage, UploadBulkDocumentStageWithoutConfigure } from '@app/models/enums';
import { ValidationResults } from '@app/models/file-imports';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { DisbursementGroupLight } from '@app/models/disbursement-group-light';
import { IdValue } from '@app/models';
import { IProgressValues } from '@app/models/file-imports/progress-values';
import { ManualPaymentDetailItem } from '@app/models/file-imports/manual-payment-detail-item';

const featureName = '[Shared Upload Bulk Document Modal]';

export const OpenUploadBulkDocumentModal = createAction(`${featureName} Open Upload Bulk Document Modal`, props<{
  entityTypeId: number,
  importTypeId?: number,
  entityId: number,
  allowedExtensions: string[],
  onPusherMessageReceived?:(data: string) => void,
}>());
export const EditUploadBulkDocumentModal = createAction(`${featureName} Edit Upload Bulk Document Modal`, props<{ entityTypeId: number, entityId: number, allowedExtensions: string[], documentImport: DocumentImport, onPusherMessageReceived?:(data: string) => void }>());

export const SubmitBulkDocumentRequest = createAction(`${featureName} Upload Bulk Document Request`, props<{ file: File, documentImport: DocumentImport }>());
export const SubmitBulkDocumentSuccess = createAction(`${featureName} Upload Bulk Document Success`, props<{ documentImport: DocumentImport }>());

export const ModalError = createAction(`${featureName} API Error`, props<{ errorMessage: string }>());

export const LoadDefaultData = createAction(`${featureName} Load Dropdown Data`, props<{ entityType: number, entityId: number }>());
export const LoadDefaultDataComplete = createAction(`${featureName} Load Dropdown Data Complete`, props<{ data: any }>());

export const LoadDisbursementGroupsData = createAction(`${featureName} Load Disbursement Groups Data`, props<{ entityId: number, removeProvisionals: boolean }>());
export const LoadDisbursementGroupsDataComplete = createAction(`${featureName} Load Disbursement Groups Data Complete`, props<{ data: DisbursementGroupLight[] }>());

export const GetDocumentImportByIdRequest = createAction(`${featureName} Get Document Import By Id Request`, props<{ id: number }>());
export const GetDocumentImportByIdSuccess = createAction(`${featureName} Get Document Import By Id Success`, props<{ documentImport: DocumentImport }>());

export const SetDocumentImportTemplate = createAction(`${featureName} Set Document Import Template`, props<{ selectedTemplate: DocumentImportTemplate }>());

export const GetDocumentImportPreviewRequest = createAction(`${featureName} Get Document Import Preview Request`, props<{ id: number }>());
export const GetDocumentImportPreviewSuccess = createAction(`${featureName} Get Document Import Preview Success`, props<{ previewFileRows: ValidationResults }>());
export const ResetDocumentImportPreviewRows = createAction(`${featureName} Reset Document Import Preview Rows`);

export const UpdateProgress = createAction(`${featureName} Update Progress`, props<{ updateProgress: boolean }>());

export const SetModalStage = createAction(`${featureName} Set Modal Stage`, props<{ stage: UploadBulkDocumentStage | UploadBulkDocumentStageWithoutConfigure }>());
export const SetDocumentImport = createAction(`${featureName} Set Document Import`, props<{ documentImport: DocumentImport }>());

export const IsValidSelect = createAction(`${featureName} Is Valid Select`, props<{ isValidSelect: boolean }>());
export const isValidGroupSelect = createAction(`${featureName} Is Valid Group Select`, props<{ isValidGroupSelect: boolean }>());
export const IsValidConfigure = createAction(`${featureName} Is Valid Configure`, props<{ isValidConfigure: boolean }>());
export const IsValidUpload = createAction(`${featureName} Is Valid Upload`, props<{ isValidUpload: boolean }>());

export const ApproveJobRequest = createAction(`${featureName} Set Job Status Request`, props<{ id: number, channelName: string }>());
export const ApproveJobSuccess = createAction(`${featureName} Set Job Status Success`);

export const ApproveDocument = createAction(`${featureName} Approve Document`);

export const ConfirmApproveDocumentCancelled = createAction(`${featureName} Confirm Approve Document Cancelled`);

export const GetDocumentImportsResultRequest = createAction(`${featureName} Get Document Imports Result Request`, props<{ entityId: number, documentTypeId: FileImportDocumentType, tab: FileImportReviewTabs, agGridParams: IServerSideGetRowsParamsExtended, status?: FileImportResultStatus }>());
export const GetDocumentImportsResultSuccess = createAction(`${featureName} Get Document Imports Result Success`, props<{ agGridParams: IServerSideGetRowsParamsExtended, tab: FileImportReviewTabs, validationResults: ValidationResults }>());

export const ResetUploadBulkDocumentState = createAction(`${featureName} Reset Upload Bulk Document State`);

export const DownloadLog = createAction(`${featureName} Download Log Document`, props<{ id: number }>());
export const DownloadFiles = createAction(`${featureName} Download Files Related to Document Import`, props<{ id: number }>());

export const OpenDocument = createAction(`${featureName} Open Document`, props<{ id: number }>());
export const DownloadDocument = createAction(`${featureName} Download Document`, props<{ id: number }>());
export const DownloadDocumentComplete = createAction(`${featureName} Download Document Complete`);
export const DownloadDocumentError = createAction(`${featureName} Download Document Error`);

export const DownloadTemplate = createAction(`${featureName} Download Template`, props<{ id: number, fileName?: string }>());
export const DownloadTemplateSuccess = createAction(`${featureName} Download Template Success`);

export const DownloadRelatedTemplate = createAction(`${featureName} Download Related To Case Template`, props<{ id: number, projectId: number, fileName?: string }>());
export const DownloadRelatedTemplateSuccess = createAction(`${featureName} Download Related To Case Template Success`);

export const IsValidationInProgress = createAction(`${featureName} Is Validation In Progress`, props<{ isValidationInProgress: boolean }>());
export const IsProcessingInProgress = createAction(`${featureName} Is Processing In Progress`, props<{ isProcessingInProgress: boolean }>());

export const Error = createAction(`${featureName} Document Error`, props<{ error: any }>());
export const ResetOnErrorUploadBulkDocumentState = createAction(`${featureName} Reset Document on Error`);

export const GetProjectFirmsOptions = createAction(`${featureName} Get Project Firms Options`, props<{ projectId: number }>());
export const GetProjectFirmsOptionsSuccess = createAction(`${featureName} Get Project Firms Options Success`, props<{ options: IdValue[] }>());

export const SetProgressValues = createAction(`${featureName} Set Progress Values`, props<{ progressValues: IProgressValues }>());
export const ResetProgressValues = createAction(`${featureName} Reset Progress Values`);

export const ReviewJobRequest = createAction(`${featureName} Review Job Request`, props<{ id: number, channelName: string }>());
export const ReviewJobSuccess = createAction(`${featureName} Review Job Success`);

export const UploadAdditionalDocuments = createAction(`${featureName} Upload Additional Documents`, props<{ documentImportId: number, files: File[]}>());
export const UploadAdditionalDocumentsSuccess = createAction(`${featureName} Upload Additional Documents Success`);
export const UpdatePaymentDetail = createAction(`${featureName} Update Payment Detail`, props<{ documentImportId: number, paymentRequestItemId: number, item: ManualPaymentDetailItem}>());
export const UpdatePaymentDetailSuccess = createAction(`${featureName} Update Payment Detail Success`);

export const UpdateDocumentImport = createAction(`${featureName} UpdateDocumentImport`, props<{ id: number }>());
export const UpdateDocumentImportSuccess = createAction(`${featureName} UpdateDocumentImport Success`, props<{ documentImport: DocumentImport }>());

export const DocumentImportGetTotalPayment = createAction(`${featureName} DocumentImportGetTotalPayment`, props<{ id: number }>());
export const DocumentImportGetTotalPaymentSuccess = createAction(`${featureName} DocumentImportGetTotalPayment Success`, props<{ totalPayment: number }>());
