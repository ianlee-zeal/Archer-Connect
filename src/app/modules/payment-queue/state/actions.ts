import { AuthorizeArcherFeesData, ColumnExport, IdValue, Org } from '@app/models';
import { BatchAction, BatchActionDto } from '@app/models/batch-action/batch-action';
import { BatchActionDocumentType } from '@app/models/enums/batch-action/batch-action-document-type.enum';
import { PaymentQueue } from '@app/models/payment-queue';
import { LienPaymentStageValidationResult } from '@app/models/payment-queue/validation-results';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { BsModalRef } from 'ngx-bootstrap/modal';
import * as fromAdvancedSearch from '@app/modules/shared/state/advanced-search/actions';
import { CopySpecialPaymentInstructionData } from '@app/models/payment-queue/copy-special-payment-instruction-data';
import { BatchActionResultStatus } from '@app/models/enums/batch-action/batch-action-result-status.enum';
import { FileImportReviewTabs } from '@app/models/enums';
import { ValidationResults } from '@app/models/file-imports';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { BatchActionReviewOptions } from '@app/models/batch-action/batch-action-review-options';
import { ApiErrorResponse } from '@app/models/api-error-response';
import { RefundTransferItem } from '@app/models/refund-transfer-request/refund-transfer-item';

export const featureName = '[Global Payment Queue]';
export const Error = createAction(`${featureName} Error Message`, props<{ error: string }>());

export const UpdateActionBar = createAction(`${featureName} Update Action Bar`, props<{ actionBar: ActionHandlersMap }>());

export const GetPaymentQueueList = createAction(`${featureName} Get List`, props<{ agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetPaymentQueueListComplete = createAction(`${featureName} Get List Complete`, props<{ paymentQueue: PaymentQueue[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const GetPaymentQueueListError = createAction(`${featureName} Get List Error`, props<{ errorMessage: string, agGridParams: IServerSideGetRowsParamsExtended }>());

export const ExportStandardRequest = createAction(`${featureName} Export Standart Request`, props<{ searchOptions: IServerSideGetRowsRequestExtended, columns: ColumnExport[], channelName: string }>());
export const ExportStandardRequestSuccess = createAction(`${featureName} Export Standart Success`, props<{ channel: string }>());
export const DownloadStandardDocument = createAction(`${featureName} Download Standart Document`, props<{ id: number }>());

export const EnqueueUpdateLienPaymentStageValidation = createAction(`${featureName} Enqueue Update Lien Payment Stage Validation`, props<{ batchAction: BatchActionDto }>());
export const EnqueueUpdateLienPaymentStageValidationSuccess = createAction(`${featureName} Enqueue Update Lien Payment Stage Validation Success`, props<{ batchAction: BatchAction }>());
export const BatchUpdateLienPaymentStageValidationCompleted = createAction(`${featureName} Batch Update Lien Payment Stage Validation Completed`);
export const BatchUpdateLienPaymentStageError = createAction(`${featureName} Batch Update Lien Payment Stage Error`, props<{ errorMessage: string, bsModalRef?: BsModalRef }>());

export const EnqueueUpdateLienPaymentStage = createAction(`${featureName} Enqueue Update Lien Payment Stage`, props<{ batchActionId: number }>());
export const EnqueueUpdateLienPaymentStageSuccess = createAction(`${featureName} Enqueue Update Lien Payment Stage Success`);

export const GetBatchActionLienPaymentStageValidationResult = createAction(`${featureName} Get Batch Action Lien Payment Stage Validation Result`, props<{ batchActionId: number, documentTypeId: BatchActionDocumentType, agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetBatchActionLienPaymentStageValidationResultSuccess = createAction(`${featureName} Get Batch Action Lien Payment Stage Validation Result Success`, props<{ agGridParams: IServerSideGetRowsParamsExtended, validationResults: LienPaymentStageValidationResult }>());
export const ResetGetBatchActionLienPaymentStageValidationResult = createAction(`${featureName} Reset Batch Action Lien Payment Stage Validation Result`);

export const SaveSearchParams = fromAdvancedSearch.SaveSearchParamsFor(featureName);
export const SaveAdvancedSearchVisibility = fromAdvancedSearch.SaveAdvancedSearchVisibilityFor(featureName);
export const SetShowExpandButtonForFilters = fromAdvancedSearch.SetShowExpandButtonForFilters(featureName);

export const GetCopySpecialPaymentInstructions = createAction(`${featureName} Get Copy Special Payment Instructions`, props<{ ledgerEntryId: number, caseId: number }>());
export const GetCopySpecialPaymentInstructionsSuccess = createAction(`${featureName} Get Copy Special Payment Instructions Success`, props<{ paymentInstructions: CopySpecialPaymentInstructionData[] }>());
export const GetCopySpecialPaymentInstructionsError = createAction(`${featureName} Get Copy Special Payment Instructions Error`, props<{ errorMessage: string }>());
export const ResetCopySpecialPaymentInstructions = createAction(`${featureName} Reset Copy Special Payment Instructions`);

export const EnqueueCopySpecialPaymentInstructionsValidation = createAction(`${featureName} Enqueue Copy Special Payment Instructions Validation`, props<{ batchAction: BatchActionDto }>());
export const EnqueueCopySpecialPaymentInstructionsValidationSuccess = createAction(`${featureName} Enqueue Copy Special Payment Instructions Validation Success`, props<{ batchAction: BatchAction }>());
export const CopySpecialPaymentInstructionsValidationCompleted = createAction(`${featureName} Copy Special Payment Instructions Validation Completed`);
export const CopySpecialPaymentInstructionsValidationError = createAction(`${featureName} Copy Special Payment Instructions Validation Error`, props<{ errorMessage: string, bsModalRef?: BsModalRef }>());

export const CopySpecialPaymentInstructionsValidationResult = createAction(`${featureName} Get Copy Special Payment Instructions Validation Result`, props<{ batchActionId: number, documentTypeId: BatchActionDocumentType, tab: FileImportReviewTabs, agGridParams: IServerSideGetRowsParamsExtended, status?: BatchActionResultStatus }>());
export const CopySpecialPaymentInstructionsValidationSuccess = createAction(`${featureName} Get Copy Special Payment Instructions Validation Success`, props<{ agGridParams: IServerSideGetRowsParamsExtended, tab: FileImportReviewTabs, validationResults: ValidationResults }>());
export const ResetCopySpecialPaymentInstructionsValidationResult = createAction(`${featureName} Reset Copy Special Payment Instructions Validation Result`);

export const EnqueueCopySpecialPaymentInstructionsApprove = createAction(`${featureName} Enqueue Copy Special Payment Instructions Approve`, props<{ batchActionId: number }>());
export const EnqueueCopySpecialPaymentInstructionsApproveSuccess = createAction(`${featureName} Enqueue Copy Special Payment Instructions Approve Success`, props<{ paymentInstructions: CopySpecialPaymentInstructionData[]}>);
export const EnqueueCopySpecialPaymentInstructionsApproveError = createAction(`${featureName} Enqueue Copy Special Payment Instructions Approve Error`, props<{ errorMessage: string }>());
export const CopySpecialPaymentInstructionsApproveCompleted = createAction(`${featureName} Copy Special Payment Instructions Approve Completed`);
export const CopySpecialPaymentInstructionsApproveError = createAction(`${featureName} Copy Special Payment Instructions Approve Error`, props<{ errorMessage: string, bsModalRef?: BsModalRef }>());

export const ValidateARApproval = createAction(`${featureName} Validate AR Approval`, props<{ batchAction: BatchActionDto }>());
export const ValidateARApprovalSuccess = createAction(`${featureName} Validate AR Approval Success`, props<{ batchAction: BatchAction }>());
export const ARApprovalSuccess = createAction(`${featureName} AR Approval Success`);
export const ARApprovalError = createAction(`${featureName} AR Approval Error`, props<{ errorMessage: string }>());

export const InvoiceArcherFeesActionCreationSuccess = createAction(`${featureName} Invoice Archer Fees Action Creation Success`, props<{ batchAction: BatchAction }>());
export const ValidateInvoiceArcherFees = createAction(`${featureName} Validate Invoice Archer Fees`, props<{ batchAction: BatchActionDto }>());
export const ValidateInvoiceArcherFeesSuccess = createAction(`${featureName} Validate Invoice Archer Fees Success`, props<{ batchAction: BatchAction }>());
export const InvoiceArcherFeesSuccess = createAction(`${featureName} Invoice Archer Fees Success`);
export const InvoiceArcherFeesError = createAction(`${featureName} Invoice Archer Fees Error`, props<{ errorMessage: string }>());
export const InvoiceArcherFeesDeficienciesSummary = createAction(`${featureName} Get Invoice Archer Fees Deficiencies Summary`, props<{ batchActionId: number, documentTypeId: BatchActionDocumentType }>());
export const InvoiceArcherFeesDeficienciesSummarySuccess = createAction(`${featureName} Get Invoice Archer Fees Summary Success`, props<{ batchActionDeficienciesReview: BatchActionReviewOptions }>());
export const LoadInvoiceArcherFees = createAction(`${featureName} Load Invoice Archer Fees`, props<{ batchActionId: number }>());
export const LoadInvoiceArcherFeesSuccess = createAction(`${featureName} Load Invoice Archer Fees Success`);
export const GetInvoiceArcherFeesResultRequest = createAction(`${featureName} Get Invoice Archer Fees Result Request`, props<{ entityId: number, documentTypeId: BatchActionDocumentType, tab: FileImportReviewTabs, agGridParams: IServerSideGetRowsParamsExtended, status?: BatchActionResultStatus }>());
export const GetInvoiceArcherFeesResultRequestSuccess = createAction(`${featureName} Get Invoice Archer Fees Result Request Success`, props<{ agGridParams: IServerSideGetRowsParamsExtended, tab: FileImportReviewTabs, validationResults: ValidationResults }>());

export const ValidateAuthorizeArcherFees = createAction(`${featureName} Validate Authorize Archer Fees`, props<{ batchAction: BatchActionDto }>());
export const ValidateAuthorizeArcherFeesSuccess = createAction(`${featureName} Validate Authorize Archer Fees Success`, props<{ batchAction: BatchAction }>());
export const ValidateAuthorizeArcherFeesError = createAction(`${featureName} Validate Authorize Archer Fees Error`, props<{ errorMessage: string, bsModalRef?: BsModalRef }>());
export const ValidateAuthorizeArcherFeesCompleted = createAction(`${featureName} Validate Authorize Archer Fees Completed`);

export const ApproveAuthorizeArcherFees = createAction(`${featureName} Approve Authorize Archer Fees`, props<{ batchActionId: number }>());
export const ApproveAuthorizeArcherFeesSuccess = createAction(`${featureName} Approve Authorize Archer Fees Success`, props<{ data: AuthorizeArcherFeesData[] }>);
export const ApproveAuthorizeArcherFeesError = createAction(`${featureName} Approve Authorize Archer Fees Error`, props<{ errorMessage: string, bsModalRef?: BsModalRef }>());
export const ApproveAuthorizeArcherFeesCompleted = createAction(`${featureName} Approve Authorize Archer Fees Completed`);

export const ValidateAuthorizeLienEntries = createAction(`${featureName} Validate Authorize Lien Entries`, props<{ batchAction: BatchActionDto }>());
export const ValidateAuthorizeLienEntriesSuccess = createAction(`${featureName} Validate Authorize Lien Entries Success`, props<{ batchAction: BatchAction }>());
export const ValidateAuthorizeLienEntriesError = createAction(`${featureName} Validate Authorize Lien Entries Error`, props<{ errorMessage: string, bsModalRef?: BsModalRef }>());
export const ValidateAuthorizeLienEntriesCompleted = createAction(`${featureName} Validate Authorize Lien Entries Completed`);

export const ApproveAuthorizeLienEntries = createAction(`${featureName} Approve Authorize Lien Entries`, props<{ batchActionId: number }>());
export const ApproveAuthorizeLienEntriesSuccess = createAction(`${featureName} Approve Authorize Lien Entries Success`, props<{ data: AuthorizeArcherFeesData[] }>);
export const ApproveAuthorizeLienEntriesError = createAction(`${featureName} Approve Authorize Lien Entries Error`, props<{ errorMessage: string, bsModalRef?: BsModalRef }>());
export const ApproveAuthorizeLienEntriesCompleted = createAction(`${featureName} Approve Authorize Lien Entries Completed`);

export const GetOrgBankAccountsList = createAction(`${featureName} Get Org Bank Accounts List`, props<{ orgId: number }>());
export const GetOrgBankAccountsListComplete = createAction(`${featureName} Get Org Bank Accounts List Complete`, props<{ bankAccountsList: IdValue[], orgId: number }>());
export const ClearOrgBankAccountsList = createAction(`${featureName} Clear Org Bank Accounts List`);

export const ValidateRefundTransferRequest = createAction(`${featureName} Validate Refund Transfer Request`, props<{ batchAction: BatchActionDto, claimantAndDetailsFile: File, additionalDocumentsFiles: File[] }>());
export const ValidateManualEntryRefundTransferRequest = createAction(`${featureName} Validate Manual Entry Refund Transfer Request`, props<{ batchAction: BatchActionDto, items: RefundTransferItem[], additionalDocumentsFiles: File[] }>());
export const RefundTransferValidationResult = createAction(`${featureName} Get Refund Transfer Validation Result`, props<{ batchActionId: number, documentTypeId: BatchActionDocumentType, tab: FileImportReviewTabs, agGridParams: IServerSideGetRowsParamsExtended, status?: BatchActionResultStatus }>());
export const RefundTransferValidationSuccess = createAction(`${featureName} Get Refund Transfer Validation Success`, props<{ agGridParams: IServerSideGetRowsParamsExtended, tab: FileImportReviewTabs, validationResults: ValidationResults }>());
export const RefundTransferValidationError = createAction(`${featureName} Get Refund Transfer Validation Error`, props<{ error: string }>());
export const ResetRefundTransferValidationResult = createAction(`${featureName} Reset Refund Transfer Validation Result`);
export const GetRefundTransferRequestInfo = createAction(`${featureName} Get Refund Transfer Request Info`, props<{ batchActionId: number }>());
export const GetRefundTransferRequestInfoSuccess = createAction(`${featureName} Get Refund Transfer Request Info Success`, props<{ amount: number, validationResults: ValidationResults }>());

export const UploadClaimantAndItemDetailsComplete = createAction(`${featureName} Upload Claimant And Item Details Complete`);
export const UploadClaimantAndItemDetailsError = createAction(`${featureName} Upload Claimant And Item Details Error`, props<{ error: ApiErrorResponse }>());

export const ProcessBatchActionSuccess = createAction(`${featureName} Process Batch Action Success`, props<{ batchAction: BatchAction }>());
export const ProcessBatchActionError = createAction(`${featureName} Process Batch Action Error`, props<{ errorMessage: string, bsModalRef?: BsModalRef }>());
export const ProcessBatchActionCompleted = createAction(`${featureName} Process Batch Action Completed`);
export const LoadBatchAction = createAction(`${featureName} Load Batch Action`, props<{ batchActionId: number }>());
export const LoadBatchActionSuccess = createAction(`${featureName} Load Batch Action Success`);
export const LoadBatchActionError = createAction(`${featureName} Load Batch Action Error`, props<{ errorMessage: string }>());
export const PostloadBatchActionCompleted = createAction(`${featureName} Postload Batch Action Completed`);
export const PostloadBatchActionError = createAction(`${featureName} Postload Batch Action Error`, props<{ errorMessage: string, bsModalRef?: BsModalRef }>());

export const GetOrg = createAction(`${featureName} Get Org`, props<{ id: number, isSubOrg?: boolean }>());
export const GetOrgComplete = createAction(`${featureName} Get Org Complete`, props<{ data: Org }>());