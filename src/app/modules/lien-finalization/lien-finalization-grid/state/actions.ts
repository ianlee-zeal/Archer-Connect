import { LienFinalizationRun } from '@app/models/lien-finalization/lien-finalization-run';
import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { IdValue } from '@app/models/idValue';

export const FEATURE_NAME = '[Lien Finalization Grid]';

export const Error = createAction(`${FEATURE_NAME} API Error`, props<{ errorMessage: string }>());

export const GetList = createAction(`${FEATURE_NAME} Get List`, props<{ agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetListComplete = createAction(`${FEATURE_NAME} Get List Complete`, props<{ lienFinalizationItems: LienFinalizationRun[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const GetListError = createAction(`${FEATURE_NAME} Get List Error`, props<{ errorMessage: string, agGridParams: IServerSideGetRowsParamsExtended }>());

export const GetCollectors = createAction(`${FEATURE_NAME} Get Collectors`, props<{ firmIds: number[] }>());
export const GetCollectorsSuccess = createAction(`${FEATURE_NAME} Get Collectors Success`, props<{ collectorOptions: IdValue[] }>());

export const CancelRun = createAction(`${FEATURE_NAME} Cancel Run`, props<{ id: number }>());
export const CancelRunSuccess = createAction(`${FEATURE_NAME} Cancel Run Success`);

export const CompleteRun = createAction(`${FEATURE_NAME} Complete Run`, props<{ id: number }>());
export const CompleteRunSuccess = createAction(`${FEATURE_NAME} Complete Run Success`);
