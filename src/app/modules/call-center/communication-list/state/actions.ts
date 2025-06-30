import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { EntityTypeEnum } from '@app/models/enums';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ActionHandlersMap } from '../../../shared/action-bar/action-handlers-map';

const featureName = '[Communication List]';

export interface IGetCommunicationListRequestParams {
  agGridParams: IServerSideGetRowsParamsExtended;
  entityType: EntityTypeEnum;
  entityId: number;
  forPaging?: boolean;
}

export const GetCommunicationListRequest = createAction(`${featureName} Get Communication List Request`, props<{ payload: IGetCommunicationListRequestParams, entity?: GridId }>());
export const GetCommunicationListSuccess = createAction(`${featureName} Get Communication List Complete`, props<{ communications: any, agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const GetCommunicationListError = createAction(`${featureName} Get Communication List Error`, props<{ errorMessage: string, agGridParams: IServerSideGetRowsParamsExtended }>());

export const UpdateActionBar = createAction(`${featureName} Update Communication List Action Bar`, props<{ actionBar: ActionHandlersMap }>());
