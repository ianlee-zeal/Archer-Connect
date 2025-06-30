import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { ClaimantDisbursementGroup } from '@app/models/claimant-disbursement-group';
import { ColumnExport } from '@app/models';

const featureName = '[Claimant-Disbursement-Groups]';

export const GetClaimantDisbursementGroupListRequest = createAction(
  `${featureName} Get Claimant Disbursement Group List Request`,
  props<{ clientId: number, agGridParams: IServerSideGetRowsParamsExtended, }>(),
);
export const GetClaimantDisbursementGroupListSuccess = createAction(
  `${featureName} Get Claimant Disbursement Group List Success`,
  props<{ disbursementGroupList: ClaimantDisbursementGroup[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>(),
);

export const ExportClientDisbursementGroupsRequest = createAction(`[${featureName}] Export Client Disbursement Groups Request`, props<{ clientId: number, agGridParams: IServerSideGetRowsParamsExtended, columns: ColumnExport[], channelName: string }>());
export const ExportClientDisbursementGroupsSuccess = createAction(`[${featureName}] Export Client Disbursement Groups Success`);
export const DownloadClientDisbursementGroupsDocument = createAction(`[${featureName}] Download Client Disbursement Groups Document`, props<{ id: number }>());
