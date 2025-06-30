import { DisbursementClaimantSummary } from '@app/models/disbursement-claimant-summary';
import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import * as fromAdvancedSearch from '@app/modules/shared/state/advanced-search/actions';
import { ColumnExport, IdValue } from '@app/models';
import { ControllerEndpoints } from '@app/models/enums';
import { SaveDocumentGeneratorRequest } from '@app/models/documents';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

export const featureName = '[Claimants Summary]';

export const Error = createAction(`${featureName} Error Message`, props<{ error: string }>());
export const GetClaimantsSummaryGrid = createAction(`${featureName} Get Claimants Summary Grid`, props<{ projectId: number, agGridParams: IServerSideGetRowsParamsExtended, }>());
export const GetClaimantsSummaryGridSuccess = createAction(`${featureName} Get Claimants Summary Grid Success`, props<{ claimantSummaryList: DisbursementClaimantSummary[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const RefreshClaimantsSummaryGrid = createAction(`${featureName} Refresh Claimants Summary Grid`, props<{ projectId: number }>());
export const SaveSearchParams = fromAdvancedSearch.SaveSearchParamsFor(featureName);

export const GetPaymentTypesForPaymentRequest = createAction(`${featureName} Get Payment Types For Payment Request`);
export const GetPaymentTypesSuccess = createAction(`${featureName} Get Payment Types Success`, props<{ paymentTypes: IdValue[] }>());
export const GetPaymentTypesForPaymentRequestSuccess = createAction(`${featureName} Get Payment Types For Payment Request Success`, props<{ paymentTypes: IdValue[] }>());

export const SaveAdvancedSearchVisibility = fromAdvancedSearch.SaveAdvancedSearchVisibilityFor(featureName);

export const DownloadClaimantsSummary = createAction(`${featureName} Download Claimants Summary`, props<{
  id: number,
  searchOptions: IServerSideGetRowsRequestExtended,
  columns: ColumnExport[],
  channelName: string,
}>());
export const DownloadClaimantsSummaryComplete = createAction(`${featureName} Download Claimants Summary Complete`, props<{ channel: string }>());
export const DownloadClaimantsSummaryDocument = createAction(`${featureName} Download Claimants Summary Document`, props<{ id: number }>());
export const DownloadElectronicDeliveryReport = createAction(`${featureName} Download Electronic Delivery Report`, props<{ id: number }>());

export const LoadTemplates = createAction(`${featureName} Load Templates`, props<{ templateTypes: number[], entityTypeId: number, documentTypes: number[], entityId?: number }>());
export const LoadTemplatesComplete = createAction(`${featureName} Load Templates Complete`, props<{ data: any }>());

export const GenerateDocuments = createAction(`${featureName} Generate Documents`, props<{ controller: ControllerEndpoints, request: SaveDocumentGeneratorRequest, id?: number }>());
export const GenerateDocumentsComplete = createAction(`${featureName} Generate Documents Complete`, props<{ data: any }>());
