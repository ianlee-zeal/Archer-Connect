import { createAction, props } from '@ngrx/store';
import { ActionLogRecord } from '@app/models/actionLogRecord';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

export const Error = createAction('[Shared Actions Log List] Actions Log API Error', props<{ errorMessage: string }>());
export const GetActionsLogRequest = createAction('[Shared Actions Log List] Get Actions Log Request', props<{ userGuid: string, params: IServerSideGetRowsParamsExtended }>());
export const GetActionsLogRequestComplete = createAction('[Shared Log In History List] Get Actions Log Request Complete', props<{ actionsLog: ActionLogRecord[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
