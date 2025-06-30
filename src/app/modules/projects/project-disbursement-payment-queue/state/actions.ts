import { PaymentQueue } from '@app/models/payment-queue';
import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import * as fromAdvancedSearch from '@app/modules/shared/state/advanced-search/actions';
import { PaymentQueueCounts } from '@app/models/payment-queue-counts';
import { SaveDocumentGeneratorRequest } from '@app/models/documents';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { ColumnExport } from '@app/models';
import { ISearchOptions } from '@app/models/search-options';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { BatchAction, BatchActionDto } from '@app/models/batch-action/batch-action';

export const FEATURE_NAME = '[Payment Queue]';

export const GetLienPaymentStages = createAction(`${FEATURE_NAME} Get Lien Payment Stages`);
export const GetLienPaymentStagesSuccess = createAction(`${FEATURE_NAME} Get Lien Payment Stages Success`, props<{ stages: SelectOption[] }>());

export const Error = createAction('[Payment Queue] Payment Queue Error', props<{ errorMessage: string }>());
export const GetPaymentQueueGrid = createAction('[Payment Queue List] Get Payment Queue Grid', props<{ agGridParams: IServerSideGetRowsParamsExtended, projectId: number }>());
export const GetPaymentQueueGridComplete = createAction('[Payment Queue List] Get Payment Queue Grid Complete', props<{ paymentQueueGrid: PaymentQueue[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const GetPaymentQueueCounts = createAction('[Payment Queue Counts] Get Payment Queue Counts', props<{ projectId: number, agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetPaymentQueueCountsComplete = createAction('[Payment Queue Counts] Get Payment Queue Counts Complete', props<{ paymentQueueCounts: PaymentQueueCounts }>());
export const SaveSearchParams = fromAdvancedSearch.SaveSearchParamsFor(FEATURE_NAME);
export const SaveAdvancedSearchVisibility = fromAdvancedSearch.SaveAdvancedSearchVisibilityFor(FEATURE_NAME);
export const SetShowExpandButtonForFilters = fromAdvancedSearch.SetShowExpandButtonForFilters(FEATURE_NAME);

export const GetSelectedPaymentQueueGrid = createAction('[Payment Queue List] Get Selected Payment Queue Grid', props<{ searchOpts: ISearchOptions, agGridParams: IServerSideGetRowsParamsExtended, projectId?: number | null }>());
export const GetSelectedPaymentQueueGridComplete = createAction('[Payment Queue List] Get Selected Payment Queue Grid Complete', props<{ paymentQueueGrid: PaymentQueue[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());

export const GetActiveLienPaymentStages = createAction(`${FEATURE_NAME} Get Active Lien Payment Stages`);
export const GetActiveLienPaymentStagesSuccess = createAction(`${FEATURE_NAME} Get Active Lien Payment Stages Success`, props<{ stages: SelectOption[] }>());

export const ExportRemittanceDetailsGeneration = createAction(`${FEATURE_NAME} Export Remittance Details Generation`, props<{ generationRequest: SaveDocumentGeneratorRequest }>());
export const ExportRemittanceDetailsGenerationComplete = createAction(`${FEATURE_NAME} Export Remittance Details Generation Success`, props<{ generationRequest: SaveDocumentGeneratorRequest }>());

export const GetChartOfAccountGroupNumbers = createAction('[Payment Queue List] Get Chart Of Account Group pNumbers', props<{ projectId: number }>());
export const GetChartOfAccountGroupNumbersComplete = createAction('[Payment Queue List] Get Chart Of Account Group Numbers Complete', props<{ coaGroupNumbers : SelectOption[] }>());

export const GetChartOfAccountNumbers = createAction('[Payment Queue List] Get Chart Of Account Numbers', props<{ projectId: number }>());
export const GetChartOfAccountNumbersComplete = createAction('[Payment Queue List] Get Chart Of Account Numbers Complete', props<{ coaNumbers: SelectOption[] }>());

export const GetLedgerEntryStatuses = createAction('[Payment Queue List] Get Ledger Entry Statuses');
export const GetLedgerEntryStatusesComplete = createAction('[Payment Queue List] Get Ledger Entry Statuses Complete', props<{ ledgerEntryStatuses: SelectOption[] }>());

export const DownloadStandardRequest = createAction('[Payment Queue List] Download Claimants Summary', props<{ id: number, searchOptions: IServerSideGetRowsRequestExtended, columns: ColumnExport[], channelName: string }>());
export const DownloadStandardRequestSuccess = createAction('[Payment Queue List] Download Claimants Summary Success', props<{ channel: string }>());
export const DownloadStandardDocument = createAction('[Payment Queue List] Download Claimants Summary Document', props<{ id: number }>());

export const DownloadCheckTableRequest = createAction('[Payment Queue List] Download Check Table Data', props<{ id: number, searchOptions: IServerSideGetRowsRequestExtended, columns: ColumnExport[], channelName: string }>());
export const DownloadCheckTableRequestSuccess = createAction('[Payment Queue List] Download Check Table Success', props<{ channel: string }>());
export const DownloadCheckTableDocument = createAction('[Payment Queue List] Download Check Table Document', props<{ id: number }>());

export const GetLienStatuses = createAction(`${FEATURE_NAME} Get Lien Statuses`);
export const GetLienStatusesSuccess = createAction(`${FEATURE_NAME} Get Lien Statuses Success`, props<{ statuses: SelectOption[] }>());
export const GetBankruptcyStatuses = createAction(`${FEATURE_NAME} Get Bankruptcy Statuses`);
export const GetBankruptcyStatusesSuccess = createAction(`${FEATURE_NAME} Get Bankruptcy Statuses Success`, props<{ options: SelectOption[] }>());
export const GetBankruptcyStages = createAction(`${FEATURE_NAME} Get Bankruptcy Stages`);
export const GetBankruptcyStagesSuccess = createAction(`${FEATURE_NAME} Get Bankruptcy Stages Success`, props<{ options: SelectOption[] }>());

export const ValidateAuthorizeLedgerEntriesRequest = createAction(`${FEATURE_NAME} Validate Authorize Ledger Entries`, props<{ batchAction: BatchActionDto}>());
export const ValidateAuthorizeLedgerEntriesRequestSuccess = createAction(`${FEATURE_NAME} Validate Authorize Ledger Entries Success`, props<{ batchAction: BatchAction }>());
export const ValidateAuthorizeLedgerEntriesRequestError = createAction(`${FEATURE_NAME} Validate Authorize Ledger Entries Error`, props < { errorMessage: string,  bsModalRef?: BsModalRef }>());
export const ValidateAuthorizeLedgerEntriesCompleted = createAction(`${FEATURE_NAME} Validate Authorize Ledger Entries Validation Completed`);

export const LoadAuthorizeLedgerEntriesRequest = createAction(`${FEATURE_NAME} Load Authorize Ledger Entries`, props<{ batchActionId: number }>());
export const LoadAuthorizeLedgerEntriesRequestSuccess = createAction(`${FEATURE_NAME} Validate Authorize Ledger Entries Success`);
export const LoadAuthorizeLedgerEntriesRequestError = createAction(`${FEATURE_NAME} Validate Authorize Ledger Entries Error`, props<{ errorMessage: string, bsModalRef?: BsModalRef }>());
export const LoadAuthorizeLedgerEntriesRequestCompleted = createAction(`${FEATURE_NAME} Validate Authorize Ledger Entries Validation Completed`);

export const GetSelectedPaymentQueueAuthorizedLedgersGrid = createAction('[Payment Queue List] Get Selected Payment Queue Authorized Ledgers Grid', props<{ searchOpts: ISearchOptions, agGridParams: IServerSideGetRowsParamsExtended, projectId?: number | null }>());
export const GetSelectedPaymentQueueAuthorizedLedgersGridComplete = createAction('[Payment Queue List] Get Selected Payment Queue Authorized Ledgers Grid Complete', props<{ paymentQueueGrid: PaymentQueue[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());

export const GetSelectedPaymentQueueUnauthorizedLedgersGrid = createAction('[Payment Queue List] Get Selected Payment Queue Unauthorized Ledgers Grid', props<{ searchOpts: ISearchOptions, agGridParams: IServerSideGetRowsParamsExtended, projectId?: number | null }>());
export const GetSelectedPaymentQueueUnauthorizedLedgersGridComplete = createAction('[Payment Queue List] Get Selected Payment Queue Unauthorized Ledgers Grid Complete', props<{ paymentQueueGrid: PaymentQueue[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());

export const GetSelectedPaymentQueueAuthorizedLedgersResultGrid = createAction('[Payment Queue List] Get Selected Payment Queue Authorized Ledgers Result Grid', props<{ searchOpts: ISearchOptions, agGridParams: IServerSideGetRowsParamsExtended, projectId?: number | null }>());
export const GetSelectedPaymentQueueAuthorizedLedgersResultGridComplete = createAction('[Payment Queue List] Get Selected Payment Queue Authorized Ledgers Result Grid Complete', props<{ paymentQueueGrid: PaymentQueue[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
