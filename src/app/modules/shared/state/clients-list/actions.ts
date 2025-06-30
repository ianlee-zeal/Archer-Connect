import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { ColumnExport } from '@app/models/column-export';
import { ActionHandlersMap } from '../../action-bar/action-handlers-map';

import * as fromAdvancedSearch from '../advanced-search/actions';

export const FEATURE_NAME = 'Shared Clients List';

export const GetAGClients = createAction(`[${FEATURE_NAME}] Get AG Clients`, props<{ params: IServerSideGetRowsParamsExtended }>());
export const GetAGClientsComplete = createAction(`[${FEATURE_NAME}] Get AG Clients Completed`, props<{
  items: any[],
  params: IServerSideGetRowsParamsExtended,
  totalRecords: number
}>());

export const UpdateClientsListActionBar = createAction(`[${FEATURE_NAME}] Update Clients List Action Bar`, props<{ actionBar: ActionHandlersMap }>());

export const DeleteClients = createAction(`[${FEATURE_NAME}] Delete AG Clients`, props<{ ids: number[], callback: Function }>());
export const DeleteClientsComplete = createAction(`[${FEATURE_NAME}] Delete Clients Complete`);

export const DownloadClients = createAction(`[${FEATURE_NAME}] Download Clients`, props<{
  agGridParams: IServerSideGetRowsParamsExtended,
  columns: ColumnExport[],
  channelName: string,
}>());
export const DownloadClientsComplete = createAction(`[${FEATURE_NAME}] Download Clients Complete`, props<{ channel: string }>());
export const DownloadClientsDocument = createAction(`[${FEATURE_NAME}] Download Clients Document`, props<{ id: number }>());

export const SaveSearchParams = fromAdvancedSearch.SaveSearchParamsFor(FEATURE_NAME);
export const SaveAdvancedSearchVisibility = fromAdvancedSearch.SaveAdvancedSearchVisibilityFor(FEATURE_NAME);

export const Error = createAction(`[${FEATURE_NAME}] Error`, props<{ error: any }>());
