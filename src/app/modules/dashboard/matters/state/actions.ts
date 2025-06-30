import { IdValue, Settlement } from '@app/models';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

const featureName = '[Matters]';

export const UpdateActionBar = createAction(`${featureName} Update Matters List Action Bar`, props<{ actionBar: ActionHandlersMap }>());

export const GetMattersListRequest = createAction(`${featureName} Get Matters List Request`, props<{agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetMattersListSuccess = createAction(`${featureName} Get Matters List Complete`, props<{ matters: IdValue[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const GetMattersListError = createAction(`${featureName} Get Matters List Error`, props<{ errorMessage: string, agGridParams: IServerSideGetRowsParamsExtended }>());

export const GetRelatedSettlementsListRequest = createAction(`${featureName} Get Related Settlements List Request`, props<{ agGridParams: IServerSideGetRowsParamsExtended, matterId: number }>());
export const GetRelatedSettlementsListSuccess = createAction(`${featureName} Get Related Settlements List Complete`, props<{ relatedSettlements: Settlement[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const GetRelatedSettlementsListError = createAction(`${featureName} Get Related Settlements List Error`, props<{ errorMessage: string, agGridParams: IServerSideGetRowsParamsExtended }>());

export const GetMatter = createAction(`${featureName} Get Matter Request`, props<{ matterId: number }>());
export const GetMatterSuccess = createAction(`${featureName} Get Matter Complete`, props<{ matter: IdValue }>());
export const MatterError = createAction(`${featureName} Matter Error`, props<{ error: string }>());
export const ClearMatterError = createAction(`${featureName} Clear Matter Error`);

export const CreateMatter = createAction(`${featureName} Create Matter Request`, props<{ matterName: string }>());
export const CreateMatterSuccess = createAction(`${featureName} Create Matter Complete`);
export const RefreshMattersRequest = createAction(`${featureName} Refresh Matters Request`);

export const GetMatterLoadingStarted = createAction(`${featureName} Get Matter Loading Started`);
