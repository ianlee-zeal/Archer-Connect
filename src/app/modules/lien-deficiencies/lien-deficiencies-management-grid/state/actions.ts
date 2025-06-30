import { IdValue } from '@app/models/idValue';
import { DeficiencyManagement } from '@app/models/lien-deficiencies/deficiency-management';
import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

export const FEATURE_NAME = '[Lien Deficiencies Management Grid]';

export const Error = createAction(`${FEATURE_NAME} API Error`, props<{ error: any }>());

export const GetList = createAction(`${FEATURE_NAME} Get List`, props<{ agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetListComplete = createAction(`${FEATURE_NAME} Get List Complete`, props<{ lienDeficiencyManagementItems: DeficiencyManagement[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const GetListError = createAction(`${FEATURE_NAME} Get List Error`, props<{ errorMessage: string, agGridParams: IServerSideGetRowsParamsExtended }>());

export const ChangeStatus = createAction(`${FEATURE_NAME} Change Status`, props<{ id: number, status: boolean }>());
export const ChangeStatusComplete = createAction(`${FEATURE_NAME} Change Status Complete`);

export const ChangeStatusError = createAction(`${FEATURE_NAME} Change Status Error`, props<{ errorMessage: string }>());

export const GetDeficiencyCategories = createAction(`${FEATURE_NAME} Get Deficiency Categories`);
export const GetDeficiencyCategoriesComplete = createAction(`${FEATURE_NAME} Get Deficiency Categories Complete`, props<{ deficiencyCategories: IdValue[] }>());