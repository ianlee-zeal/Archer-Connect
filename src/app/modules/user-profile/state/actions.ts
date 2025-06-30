import { createAction, props } from '@ngrx/store';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { UserProfileDetails } from '@app/models/user-profile-details';
import { UserSettings } from '@app/models/user-settings';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { TimeZone } from '@app/models/time-zone';

const UserProfile: string = '[UserProfile]';

export const Error = createAction(`${UserProfile} API Error`, props<{ error: string }>());
export const UpdateUserProfileActionBar = createAction(`${UserProfile} Update User Profile Action Bar`, props<{ actionBar: ActionHandlersMap }>());

export const GetUserProfileDetails = createAction(`${UserProfile} Get User Profile Details`, props<{ id: number }>());
export const GetUserProfileDetailsCompleted = createAction(`${UserProfile} Get User Profile Details Completed`, props<{ userProfile: UserProfileDetails }>());

export const SaveUserProfileDetails = createAction(`${UserProfile}  Save User Profile Details`, props<{ userProfile: UserProfileDetails, timezone: TimeZone }>());
export const SaveUserProfileDetailsCompleted = createAction(`${UserProfile}  Save User Profile Details Completed`);

export const GetUserProfileSettings = createAction(`${UserProfile} Get User Profile Settings`, props<{ userId: string }>());
export const GetUserProfileSettingsComplete = createAction(`${UserProfile} Get User Profile Settings Complete`, props<{ userSettings: UserSettings }>());

export const GetCountriesPhoneCodes = createAction(`${UserProfile} Get Countries Phone Codes`);
export const GetCountriesPhoneCodesComplete = createAction(`${UserProfile} Get Countries Phone Codes Complete`, props<{ countriesPhoneCodes: SelectOption[] }>());

export const UpdateUserProfileSettingsRequest = createAction(`${UserProfile} Update User Profile Settings Request`, props<{ userSettings: UserSettings }>());
export const UpdateUserProfileSettingsSuccess = createAction(`${UserProfile} Update User Profile Settings Success`);
export const UpdateUserProfileSettingsError = createAction(`${UserProfile} Update User Profile Settings Error`, props<{ error: any }>());
