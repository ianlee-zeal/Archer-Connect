import { createReducer, on, Action } from '@ngrx/store';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { UserProfileDetails } from '@app/models/user-profile-details';
import { UserSettings } from '@app/models/user-settings';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import * as userProfileActions from './actions';
import * as mfaModalActions from '../../shared/state/mfa-code-modal/actions';

export interface IUserProfileState {
  actionBar: ActionHandlersMap;
  userProfile: UserProfileDetails;
  userSettings: UserSettings;
  countriesPhoneCodes: SelectOption[];
  error: any;
}

export const userProfileInitialState: IUserProfileState = {
  actionBar: null,
  userProfile: null,
  userSettings: null,
  countriesPhoneCodes: null,
  error: null,
};

export const Reducer = createReducer(
  userProfileInitialState,
  on(userProfileActions.GetUserProfileSettingsComplete, (state, { userSettings }) => ({ ...state, userSettings })),
  on(userProfileActions.UpdateUserProfileActionBar, (state, { actionBar }) => ({ ...state, actionBar })),
  on(userProfileActions.GetUserProfileDetails, state => ({ ...state, userProfile: null })),
  on(userProfileActions.GetUserProfileDetailsCompleted, (state, { userProfile }) => ({ ...state, userProfile })),
  on(userProfileActions.GetCountriesPhoneCodesComplete, (state, { countriesPhoneCodes }) => ({ ...state, countriesPhoneCodes })),
  on(userProfileActions.UpdateUserProfileSettingsError, (state, { error }) => ({ ...state, error })),
  on(mfaModalActions.SendMfaCodeRequestForNewAuthyUser, state => ({ ...state, error: null })),
  on(mfaModalActions.SendMfaCodeRequest, state => ({ ...state, error: null })),
);

export function reducer(state: IUserProfileState | undefined, action: Action) {
  return Reducer(state, action);
}
