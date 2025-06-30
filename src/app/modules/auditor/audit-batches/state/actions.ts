import { AuditRun } from '@app/models/auditor/audit-run';
import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { IdValue } from '@app/models/idValue';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

export const FEATURE_NAME = '[Audit Batches]';

export const Error = createAction(`${FEATURE_NAME} API Error`, props<{ errorMessage: string }>());

export const GetList = createAction(`${FEATURE_NAME} Get List`, props<{ agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetListComplete = createAction(`${FEATURE_NAME} Get List Complete`, props<{ auditBatches: AuditRun[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const GetListError = createAction(`${FEATURE_NAME} Get List Error`, props<{ errorMessage: string, agGridParams: IServerSideGetRowsParamsExtended }>());

export const GetCollectors = createAction(`${FEATURE_NAME} Get Collectors`, props<{ searchOptions: IServerSideGetRowsRequestExtended }>());
export const GetCollectorsSuccess = createAction(`${FEATURE_NAME} Get Collectors Success`, props<{ collectorOptions: IdValue[] }>());
