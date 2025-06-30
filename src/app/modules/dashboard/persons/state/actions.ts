import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';

import { Person } from '@app/models/person';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ColumnExport } from '@app/models/column-export';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import * as fromAdvancedSearch from '@app/modules/shared/state/advanced-search/actions';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

const featureName = '[Persons Modules Common]';

export const GoBack = createAction(`${featureName} Go Back`);
export const UpdateActionBar = createAction(`${featureName} Update Action Bar`, props<{ actionBar: ActionHandlersMap }>());
export const UpdatePreviousPersonId = createAction(`${featureName} Update Previos Person Id`, props<{ prevPersonId: number }>());
export const UpdatePreviousPersonUrl = createAction(`${featureName} Update Selected Persons ClaimantId`, props<{ personPreviousUrl: string }>());

export const FEATURE_NAME = '[Persons]';

export const Error = createAction(`${FEATURE_NAME} API Error`, props<{ error: string }>());
export const GetPersonsList = createAction(`${FEATURE_NAME} Get List`, props<{ agGridParams: IServerSideGetRowsParamsExtended }>());
export const GetPersonsListComplete = createAction(`${FEATURE_NAME} Get List Complete`, props<{ persons: Person[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const GetPersonsListError = createAction(`${FEATURE_NAME} Get List Error`, props<{ errorMessage: string, agGridParams: IServerSideGetRowsParamsExtended }>());
export const CreatePerson = createAction(`${FEATURE_NAME} Create New`, props<{ person: Person, modal: BsModalRef }>());
export const CreatePersonComplete = createAction(`${FEATURE_NAME} Create New Complete`, props<{ personId: number, modal: BsModalRef }>());
export const ResetCreatePersonState = createAction(`${FEATURE_NAME} Reset Create Person State`);
export const DeletePerson = createAction(`${FEATURE_NAME} Delete`, props<{ id: number }>());
export const DeletePersonComplete = createAction(`${FEATURE_NAME} Delete Complete`);
export const RefreshPersonsList = createAction(`${FEATURE_NAME} Refresh List`);

export const SaveSearchParams = fromAdvancedSearch.SaveSearchParamsFor(FEATURE_NAME);
export const SaveAdvancedSearchVisibility = fromAdvancedSearch.SaveAdvancedSearchVisibilityFor(FEATURE_NAME);

export const UpdatePersonsListActionBar = createAction(`[${FEATURE_NAME}] Update Persons List Action Bar`, props<{ actionBar: ActionHandlersMap }>());

export const DownloadPersons = createAction(`${featureName} Download Claimants Summary`, props<{
  searchOptions: IServerSideGetRowsRequestExtended,
  columns: ColumnExport[],
  channelName: string,
}>());
export const DownloadPersonsComplete = createAction(`[${FEATURE_NAME}] Download Persons Complete`, props<{ channel: string }>());
export const DownloadPersonsDocument = createAction(`[${FEATURE_NAME}] Download Persons Document`, props<{ id: number }>());
