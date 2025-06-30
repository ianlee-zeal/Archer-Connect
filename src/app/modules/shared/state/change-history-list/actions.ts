import { ChangeHistory } from '@app/models/change-history';
import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

export const GetChangeHistoryList = createAction('[Shared Change History List] Get Change History List', props<{ electionFormId: number, agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetChangeHistoryListComplete = createAction('[Shared Change History List] Get Change History List Complete', props<{ changeHistory: ChangeHistory[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());

export const GetProbateChangeHistoryList = createAction('[Shared Change History List] Get Probate Change History List', props<{ probateId: number, agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetProbateChangeHistoryListComplete = createAction('[Shared Change History List] Get Probate Change History List Complete', props<{ changeHistory: ChangeHistory[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());

export const Error = createAction('[Shared Change History List] Error', props<{ errorMessage: string }>());
