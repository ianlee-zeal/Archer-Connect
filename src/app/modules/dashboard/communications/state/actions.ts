import { ColumnExport } from '@app/models';
import { CommunicationRecord } from '@app/models/communication-center/communication-record';
import { EntityTypeEnum } from '@app/models/enums';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

const featureName = '[Global Communication Search]';

export const UpdateActionBar = createAction(`${featureName} Update Global Communication Search List Action Bar`, props<{ actionBar: ActionHandlersMap }>());

export const GetGlobalCommunicationSearchListRequest = createAction(`${featureName} Get Global Communication Search List Request`, props<{ agGridParams: IServerSideGetRowsParamsExtended, }>());
export const GetGlobalCommunicationSearchListSuccess = createAction(`${featureName} Get Global Communication Search List Complete`, props<{ communications: CommunicationRecord[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const GetGlobalCommunicationSearchListError = createAction(`${featureName} Get Global Communication Search List Error`, props<{ errorMessage: string, agGridParams: IServerSideGetRowsParamsExtended }>());

export const DownloadCommunications = createAction(`${featureName} Download Claimants Summary`, props<{
  searchOptions: IServerSideGetRowsRequestExtended,
  columns: ColumnExport[],
  channelName: string,
}>());
export const DownloadCommunicationsComplete = createAction(`[${featureName}] Download Communications Complete`, props<{ channel: string }>());
export const DownloadCommunicationsDocument = createAction(`[${featureName}] Download Communications Document`, props<{ id: number }>());
export const GoToCommunication = createAction(`[${featureName}] GoToCommunication`, props<{ entityId: number; entityTypeId: EntityTypeEnum; id: number; canReadNotes: boolean }>());

export const Error = createAction(`${featureName} API Error`, props<{ error: string }>());
