import { createAction, props } from '@ngrx/store';

import { EntityTypeEnum } from '@app/models/enums';
import { IdValue, QuickSearchItem } from '@app/models';
import { IGridLocalData, IGridSettings } from './root.state';
import { EntityStatus } from '../models/entity-status';

const featureName = '[Root]';

export const LoadData = createAction('[Root] Load Global Data');
export const LoadDataComplete = createAction('[Root] Load Data Complete', props<{ data: any[] }>());
export const Error = createAction('[Root] Error', props<{ error: any, title?: string }>());
export const GetGridSettings = createAction('[Root] Get Grid Settings', props<{ key: string }>());
export const GetGridSettingsSuccess = createAction('[Root] Get Grid Settings Success', props<{ key: string, data: IGridSettings }>());
export const SetGridSettings = createAction('[Root] Set Grid Settings', props<{ key: string, gridSettings: IGridSettings }>());
export const SetGridSettingsSuccess = createAction('[Root] Set Grid Settings Success', props<{ key: string, data: IGridSettings }>());
export const SetGridLocalData = createAction('[Root] Set Grid Local Data', props<{ gridId: string, gridLocalData: Partial<IGridLocalData> }>());
export const GridRowToggleCheckbox = createAction('[Root] Grid Row Toggle Checkbox', props<{ gridId: string, selectedRecordsIds: Map<string, boolean> }>());
export const SetAllRowSelected = createAction('[Root] Set All Row Selected', props<{ gridId: string, isAllRowSelected: boolean }>());
export const ClearSelectedRecordsState = createAction('[Root] Clear Selected Records State', props<{ gridId: string }>());
export const ClearGridLocalData = createAction('[Root] Clear Grid Local Data', props<{ gridId: string }>());

export const GetEntityStatuses = createAction('[Root] Get Entity Statuses', props<{ entityTypeId: EntityTypeEnum }>());
export const GetEntityStatusesComplete = createAction('[Root] Get Entity Statuses Complete', props<{ statuses: EntityStatus[] }>());

export const NavigateToUrl = createAction('[Root] Navigate To Url', props<{ url: string }>());

export const LoadingStarted = createAction('[Root] Loading Started', props<{ actionNames: string[] }>());
export const LoadingFinished = createAction('[Root] Loading Finished', props<{ actionName: string }>());
export const ResetLoading = createAction('[Root] Loading Reset');

export const SaveToStorage = createAction('[Root] Save To Storage', props<{ key: string, data: Object }>());
export const SaveToStorageSuccess = createAction('[Root] Save To Storage Success', props<{ data: Object }>());

export const LoadFromStorage = createAction('[Root] Load From Storage', props<{ key: string }>());
export const LoadFromStorageSuccess = createAction('[Root] Load From Storage Success', props<{ data: Object }>());

export const ClearStorage = createAction('[Root] Clear Storage', props<{ key: string }>());

export const GetDropdownOptionsSuccess = createAction('[Root] Get Dropdown Options Success', props<{ key: string, values: IdValue[] }>());

export const GetProjectTypes = createAction(`${featureName} Get Project Types`);
export const GetProjectStatuses = createAction(`${featureName} Get Project Statuses`);
export const GetElectionFormStatuses = createAction(`${featureName} Get Election Form Statuses`);

export const GetStatuses = createAction(`${featureName} Get Statuses`, props<{ entityType: EntityTypeEnum }>());
export const GetStatusesSuccess = createAction(`${featureName} Get Statuses Success`, props<{ entityType: EntityTypeEnum, statuses: IdValue[] }>());

export const GetBatchPaymentOptions = createAction(`${featureName} Get Batch Payment Options`);
export const GetFrequencyOptions = createAction(`${featureName} Get Frequency Options`);
export const GetBillToOptions = createAction(`${featureName} Get Bill To Options`);

export const QuickSearch = createAction(`${featureName} Quick Search`, props<{ query: string, page?: number, perPage?: number }>());
export const QuickSearchSuccess = createAction(`${featureName} Quick Search Success`, props<{ foundItems: QuickSearchItem[] }>());
export const QuickSearchClear = createAction(`${featureName} Quick Search Clear`);

export const GetUserBanner = createAction(`${featureName} Get User Banner'`);
export const GetUserBannerCompleted = createAction(`${featureName} Get User Banner Completed`, props<{ message: string }>());
export const InitializeBanner = createAction(`${featureName} Initialize Banner`);
export const ClearBanner = createAction(`${featureName} Close Banner`);
