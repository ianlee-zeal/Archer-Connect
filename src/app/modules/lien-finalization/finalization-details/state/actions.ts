import { LienFinalizationDetail } from '@app/models/lien-finalization/lien-finalization-detail';
import { LienFinalizationRun } from '@app/models/lien-finalization/lien-finalization-run';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

export const FEATURE_NAME = '[Finalization Details]';

export const Error = createAction(`${FEATURE_NAME} API Error`, props<{ errorMessage: string }>());

export const GetFinalizationDetailsLoadingStarted = createAction(`${FEATURE_NAME} Get Finalization Details Loading Started`);

export const GetFinalizationDetails = createAction(`${FEATURE_NAME} Get Finalization Details`, props<{ searchOptions: IServerSideGetRowsRequestExtended }>());
export const GetFinalizationDetailsComplete = createAction(`${FEATURE_NAME} Get Finalization Details Complete`, props<{ item: LienFinalizationRun }>());
export const ResetFinalizationDetails = createAction(`${FEATURE_NAME} Get Reset Finalization Details`);

export const GetFinalizationDetailsGrid = createAction(`${FEATURE_NAME} Get Finalization Details Grid`, props<{ agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetFinalizationDetailsGridComplete = createAction(`${FEATURE_NAME} Get Finalization Details Grid Complete`, props<{ finalizationDetails: LienFinalizationDetail[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const GetFinalizationDetailsGridError = createAction(`${FEATURE_NAME} Get Finalization Details Grid Error`, props<{ errorMessage: string, agGridParams: IServerSideGetRowsParamsExtended }>());

export const SelectLien = createAction(`${FEATURE_NAME} Select Lien`, props<{ id: number, status: boolean }>());
export const SelectLienComplete = createAction(`${FEATURE_NAME} Select Lien Complete`);

export const AcceptLien = createAction(`${FEATURE_NAME} Accept Lien`, props<{ id: number, status: boolean }>());
export const AcceptLienComplete = createAction(`${FEATURE_NAME} Accept Lien Complete`);
