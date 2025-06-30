import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { createAction, props } from '@ngrx/store';

export const GetSubOrgListRequest = createAction('[Sub-Org-List] Get Sub-Org List Request', props<{ orgId: number, params: IServerSideGetRowsParamsExtended }>());
export const GetSubOrgListSuccess = createAction('[Sub-Org-List]] Get Sub-Org List Success', props<{ params: any, agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const GetSubOrgListError = createAction('[Sub-Org-List]] Get Sub-Org List Error', props<{ errorMessage: string, agGridParams: IServerSideGetRowsParamsExtended }>());
