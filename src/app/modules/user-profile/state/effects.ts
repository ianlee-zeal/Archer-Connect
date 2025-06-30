import { Injectable } from '@angular/core';
import * as services from '@app/services';
import { of } from 'rxjs';
import { createEffect, ofType, Actions } from '@ngrx/effects';
import { mergeMap, switchMap, catchError, tap } from 'rxjs/operators';

import { UserProfileDetails } from '@app/models/user-profile-details';
import { UserSettings } from '@app/models/user-settings';
import { ToastService, ModalService } from '@app/services';
import { Store } from '@ngrx/store';
import { AppState } from '@app/modules/auth/state';
import { TimeZoneService } from '@app/services/time-zone.servise';
import { DefaultGlobalSearchTypeService } from '@app/services/default-gobal-search-type.service';
import * as authActions from 'src/app/modules/auth/state/auth.actions';
import { SelectHelper } from '@app/helpers/select.helper';
import * as UserProfileActions from './actions';

@Injectable()
export class UserProfileEffects {
  constructor(
    private store: Store<AppState>,
    private usersService: services.UsersService,
    private actions$: Actions,
    private toaster: ToastService,
    private timeZoneService: TimeZoneService,
    private defaultGlobalSearchTypeService: DefaultGlobalSearchTypeService,
    private modalService: ModalService,
  ) {}


  getUserProfileDetails = createEffect(() => this.actions$.pipe(
    ofType(UserProfileActions.GetUserProfileDetails),
    mergeMap(action => this.usersService.getUserProfile(action.id).pipe(
      switchMap(response => [UserProfileActions.GetUserProfileDetailsCompleted({ userProfile: UserProfileDetails.toModel(response) })]),
      catchError(error => of(UserProfileActions.Error({ error }))),
    )),
  ));


  getUserProfileSettings$ = createEffect(() => this.actions$.pipe(
    ofType(UserProfileActions.GetUserProfileSettings),
    mergeMap(action => this.usersService.getUserSettings(action.userId).pipe(
      switchMap(response => {
        const userProfileSettings: UserSettings = new UserSettings(response);
        userProfileSettings.userId = action.userId;
        return [UserProfileActions.GetUserProfileSettingsComplete({ userSettings: UserSettings.toModel(userProfileSettings) })];
      }),
    )),
  ));


  updateUserProfileSettings$ = createEffect(() => this.actions$.pipe(
    ofType(UserProfileActions.UpdateUserProfileSettingsRequest),
    mergeMap(action => (this.usersService.updateUserProfileSettings(UserSettings.toDTO(action.userSettings)))
      .pipe(
        switchMap(response => {
          if (response.success) {
            this.modalService.hide();
            this.toaster.showSuccess('User Profile Settings were updated');
            return [
              UserProfileActions.UpdateUserProfileSettingsSuccess(),
              UserProfileActions.GetUserProfileSettings({ userId: action.userSettings.userId }),
            ];
          }
          if (response.isLocked) {
            this.modalService.hide();
            return [authActions.AuthLogout()];
          }
          return [UserProfileActions.UpdateUserProfileSettingsError({ error: response.error })];
        }),
        catchError(error => of(UserProfileActions.UpdateUserProfileSettingsError({ error }))),
      )),
  ));


  getCountriesPhoneCodes$ = createEffect(() => this.actions$.pipe(
    ofType(UserProfileActions.GetCountriesPhoneCodes),
    mergeMap(() => (this.usersService.getCountriesPhoneCodes())
      .pipe(
        switchMap(response => {
          let countriesPhoneCodes = SelectHelper.toOptions(
            response,
            item => `${item.value}_${item.text}`,
            item => item.text,
          );

          const UScode = countriesPhoneCodes.find(o => o.name === 'United States (+1)');

          if (UScode) {
            countriesPhoneCodes = [UScode, ...countriesPhoneCodes];
          }

          return [UserProfileActions.GetCountriesPhoneCodesComplete({ countriesPhoneCodes }),
          ];
        }),
      )),
  ));


  saveUserProfileDetails$ = createEffect(() => this.actions$.pipe(
    ofType(UserProfileActions.SaveUserProfileDetails),
    mergeMap(({ userProfile, timezone }) => this.usersService.saveUserProfile(UserProfileDetails.toDto(userProfile)).pipe(
      switchMap(() => {
        this.toaster.showSuccess('User Profile was updated');
        return [
          UserProfileActions.SaveUserProfileDetailsCompleted(),
          authActions.UpdateUserTimezone({ timezone }),
          UserProfileActions.GetUserProfileDetails({ id: userProfile.userId }),
        ];
      }),
      catchError(error => of(UserProfileActions.Error({ error }))),
    )),
  ));


  error$ = createEffect(() => this.actions$.pipe(
    ofType(UserProfileActions.Error),
    tap(action => {
      this.toaster.showError(action.error);
    }),
  ), { dispatch: false });
}
