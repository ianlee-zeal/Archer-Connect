import { createAction, props } from '@ngrx/store';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { SearchState } from '@app/models/advanced-search/search-state';
import { SavedSearch } from '../../../../models/saved-search';
import { EntityTypeEnum } from '../../../../models/enums/entity-type.enum';
import { SelectOption } from '../../_abstractions/base-select';

export const Error = createAction('[Shared Saved Search] Saved Search Error', props<{ errorMessage: string }>());
export const GetSavedSearchList = createAction('[Shared Saved Search List] Get Saved Search List', props<{ entityType: number }>());
export const GetSavedSearchListComplete = createAction('[Shared Saved Search List] Get Saved Search List Complete', props<{ savedSearchList: SavedSearch[] }>());

export const GetSavedSearchesGrid = createAction('[Shared Saved Search List] Get Saved Searches Grid', props<{ agGridParams: IServerSideGetRowsParamsExtended, }>());
export const GetSavedSearchesGridComplete = createAction('[Shared Saved Search List] Get Saved Searches Grid Complete', props<{ savedSearchesGrid: SavedSearch[], agGridParams: IServerSideGetRowsParamsExtended, totalRecords: number }>());
export const RefreshSavedSearchesGrid = createAction('[Shared Saved Search List] Refresh Saved Searches Grid');
export const SetLastRunDate = createAction('[Shared Saved Search List] Set Last Run Date', props<{ id: number }>());

export const ShowSavedSearchListByEntityType = createAction('[Shared Saved Search List] Show Saved Search List By Entity Type', props<{ value: boolean }>());

export const GetSavedSearchListByEntityType = createAction('[Shared Saved Search List] Get Saved Search List By Entity Type', props<{ entityType: number }>());
export const GetSavedSearchListByEntityTypeComplete = createAction('[Shared Saved Search List] Get Saved Search List By Entity Type Complete', props<{ savedSearchList: SavedSearch[] }>());
export const GetUsersOptionsRequest = createAction('[Admin-Users] Get Users Options Request', props<{ orgId: number, search?: any }>());
export const GetUsersOptionsComplete = createAction('[Admin-Users] Get Users Options Complete', props<{ users: SelectOption[] }>());

export const SaveSearch = createAction('[Shared Save Search] Save Search', props<{ search: SavedSearch }>());
export const ResetCurrentSearch = createAction('[Shared Save Search] Reset Current Search', props<{ entityType: EntityTypeEnum }>());

export const GetSavedSearch = createAction('[Shared Saved Search] Get Saved Search', props<{ id: number, entityType: EntityTypeEnum }>());
export const GetSavedSearchComplete = createAction('[Shared Saved Search] Get Saved Search Complete', props<{ entityType: EntityTypeEnum, savedSearch: SavedSearch }>());

export const SaveRemovedSearches = createAction('[Shared Save Removed Searches] Save Search', props<{ removedSearches: SearchState[] }>());
export const ResetRemovedSearches = createAction('[Shared Reset Removed Searches] Save Search', props<{ entityType: EntityTypeEnum }>());

export const SwitchEditState = createAction('[Shared Saved Search] Mark Saved Search As Edited', props<{ isEdited: boolean }>());
export const DeleteSavedSearch = createAction('[Shared Saved Search] Delete Saved Search', props<{ id: number, entityType: EntityTypeEnum }>());
export const DeleteSavedSearchComplete = createAction('[Shared Saved Search] Delete Saved Search Complete');

export const DeleteSavedSearchByIdRequest = createAction('[Shared Saved Search] Delete Saved Search By Id', props<{ id: number, entityType: EntityTypeEnum }>());
export const DeleteSavedSearchByIdRequestComplete = createAction('[Shared Saved Search] Delete Saved Search By Id Complete');
