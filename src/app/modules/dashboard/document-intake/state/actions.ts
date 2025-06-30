import { DocumentIntakeItem } from '@app/models';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

const featureName = '[Document Intake]';

export const UpdateActionBar = createAction(`${featureName} Update Document Intake List Action Bar`, props<{ actionBar: ActionHandlersMap }>());

export const GetDocumentIntakeListRequest = createAction(`${featureName} Get Document Intake List Request`, props<{agGridParams: IServerSideGetRowsParamsExtended, }>());
export const GetDocumentIntakeListSuccess = createAction(`${featureName} Get Document Intake List Complete`, props<{ documentIntakes: DocumentIntakeItem[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const GetDocumentIntakeListError = createAction(`${featureName} Get Document Intake List Error`, props<{ errorMessage: string, agGridParams: IServerSideGetRowsParamsExtended }>());
