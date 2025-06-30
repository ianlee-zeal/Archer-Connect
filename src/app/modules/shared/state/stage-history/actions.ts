import { LedgerChangeHistory } from '@app/models/ledger-change-history';
import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

const featureName = '[Shared Stage History List]';

export const GetStageHistoryList = createAction(`${featureName} Get Stage History List`, props<{ id: number, agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetStageHistoryListComplete = createAction(`${featureName} Get Stage History List Complete`, props<{ changeHistory: LedgerChangeHistory[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const Error = createAction(`${featureName} Error`, props<{ errorMessage: string }>());
