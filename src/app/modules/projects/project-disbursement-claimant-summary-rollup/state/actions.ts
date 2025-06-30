import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import * as fromAdvancedSearch from '@app/modules/shared/state/advanced-search/actions';
import { ClaimantSummaryRollup } from '@app/models/claimant-summary-rollup';
import { ColumnExport } from '@app/models';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

export const featureName = '[Claimants Summary Rollup]';

export const Error = createAction(`${featureName} Error Message`, props<{ error: string }>());
export const GetClaimantsSummaryRollupGrid = createAction(`${featureName} Get Claimants Summary Rollup Grid`, props<{ projectId: number, agGridParams: IServerSideGetRowsParamsExtended, }>());
export const GetClaimantsSummaryRollupGridSuccess = createAction(`${featureName} Get Claimants Summary Rollup Grid Success`, props<{ claimantSummaryRollupList: ClaimantSummaryRollup[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const RefreshClaimantsSummaryRollupGrid = createAction(`${featureName} Refresh Claimants Summary Rollup Grid`, props<{ projectId: number }>());
export const DownloadClaimantsSummaryRollup = createAction(`${featureName} Download Claimants Summary Rollup`, props<{
  id: number,
  searchOptions: IServerSideGetRowsRequestExtended,
  columns: ColumnExport[],
  channelName: string,
}>());
export const DownloadClaimantsSummaryRollupComplete = createAction(`${featureName} Download Claimants Summary Rollup Complete`, props<{ channel: string }>());
export const DownloadClaimantsSummaryRollupDocument = createAction(`${featureName} Download Claimants Summary Rollup Document`, props<{ id: number }>());
export const SaveSearchParams = fromAdvancedSearch.SaveSearchParamsFor(featureName);
export const SaveAdvancedSearchVisibility = fromAdvancedSearch.SaveAdvancedSearchVisibilityFor(featureName);
