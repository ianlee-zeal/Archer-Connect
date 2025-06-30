import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { ClientService, ColumnExport } from '@app/models';

import { ClaimantDetailsRequest } from '@app/modules/shared/_abstractions';

const featureName = '[Probate Dashboard Claimants]';
export const gridFeatureName = `${featureName} [Grid]`;

export const GetClaimantsList = createAction(`${featureName} Get Claimants List`, props<{ projectId: number, rootProductCategoryId:number, agGridParams?: IServerSideGetRowsParamsExtended, lienTypes?: number[], lienPhases?: number[], clientStatuses?: number[] }>());
export const GetClaimantsListSuccess = createAction(`${featureName} Get Claimants List Success`, props<{ agGridParams: IServerSideGetRowsParamsExtended, clients: ClientService[], totalRecords: number }>());

export const GoToClaimantDetails = createAction(`${featureName} Go To Claimant Details`, props<{ claimantDetailsRequest: ClaimantDetailsRequest }>());
export const DownloadClaimants = createAction(`${featureName} Download Claimants List`, props<{ channelName: string, agGridParams: IServerSideGetRowsParamsExtended, columns: ColumnExport[], rootProductCategoryId: number }>());
export const DownloadClaimantsComplete = createAction(`${featureName} Download Claimants List Complete`);
export const DownloadClaimantsDocument = createAction(`[${featureName}] Download Claimants List Document`, props<{ id: number }>());

export const Error = createAction(`${featureName} Error`, props<{ errorMessage: string, agGridParams?: IServerSideGetRowsParamsExtended }>());
