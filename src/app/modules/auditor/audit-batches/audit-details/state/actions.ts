import { AuditRun } from '@app/models/auditor/audit-run';
import { AuditRunDetails } from '@app/models/auditor/audit-run-details';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

export const FEATURE_NAME = '[Audit Details]';

export const Error = createAction(`${FEATURE_NAME} API Error`, props<{ errorMessage: string }>());

export const GetAuditDetailsLoadingStarted = createAction(`${FEATURE_NAME} Get Audit Details Loading Started`);

export const GetAuditDetails = createAction(`${FEATURE_NAME} Get Audit Details`, props<{ searchOptions: IServerSideGetRowsRequestExtended }>());
export const GetAuditDetailsComplete = createAction(`${FEATURE_NAME} Get Audit Details Complete`, props<{ item: AuditRun }>());
export const ResetAuditDetails = createAction(`${FEATURE_NAME} Get Reset Audit Details`);

export const GetAuditClaimsList = createAction(`${FEATURE_NAME} Get Audit Claims List`, props<{ agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetAuditClaimsListComplete = createAction(`${FEATURE_NAME} Get Audit Claims List Complete`, props<{ auditClaims: AuditRunDetails[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const GetAuditClaimsListError = createAction(`${FEATURE_NAME} Get Audit Claims List Error`, props<{ errorMessage: string, agGridParams: IServerSideGetRowsParamsExtended }>());

export const ExportAuditDetails = createAction(`[${FEATURE_NAME}] Export Audit Details`, props<{ id: number, channelName: string }>());
export const ExportAuditDetailsComplete = createAction(`[${FEATURE_NAME}] Export Audit Details Complete`, props<{ channel: string }>());
