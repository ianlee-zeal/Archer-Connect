import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { Store, ActionsSubject } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { ofType } from '@ngrx/effects';
import { OidcSecurityService } from 'angular-auth-oidc-client';

import { Editable } from '@app/modules/shared/_abstractions/editable';
import { AppState } from '@app/modules/admin/state/state';
import { authSelectors } from '@app/modules/auth/state';
import { UserSettings } from '@app/models/user-settings';
import { ModalService, PermissionService, ServerErrorService } from '@app/services';
import { MfaCodeModalComponent } from '@app/modules/shared/mfa-code-modal/mfa-code-modal.component';
import { sharedSelectors } from '@app/modules/shared/state';
import { SaveUserEnteredMfaCode } from '@app/modules/shared/state/mfa-code-modal/actions';
import { AuthyUpdateRequest, UserInfo } from '@app/models/users';
import { UserProfileDetails } from '@app/models/user-profile-details';
import { PermissionTypeEnum, PermissionActionTypeEnum } from '@app/models/enums';
import * as services from '@app/services';
import { userProfileSettings, countriesPhoneCodes, userProfile as userProfileDetails } from '../state/selectors';
import * as commonActions from '../../shared/state/common.actions';
import * as actions from '../state/actions';

@Component({
  selector: 'app-security-settings',
  templateUrl: './security-settings.component.html',
  styleUrls: ['./security-settings.component.scss'],
})
export class SecuritySettingsComponent extends Editable implements OnInit, OnDestroy {
  private ngUnsubscribe$ = new Subject<void>();

  private mfaCode: string;
  private mfaPhoneNumber: number;

  public userProfileSettings: UserSettings;
  public userProfileDetails: UserProfileDetails;
  public isMfaEdit: boolean = false;

  readonly countriesPhoneCodes$ = this.store.select(countriesPhoneCodes);
  private readonly mfaCode$ = this.store.select(sharedSelectors.mfaCodeModalSelectors.code);
  private readonly mfaPhoneNumber$ = this.store.select(sharedSelectors.mfaCodeModalSelectors.phoneNumber);
  public user$ = this.store.select<any>(authSelectors.getUser);

  public readonly resetPermission = PermissionService.create(PermissionTypeEnum.Users, PermissionActionTypeEnum.ResetMFA);

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  public get haveTrustedDevice(): boolean {
    return this.userProfileSettings.trustedDevices && this.userProfileSettings.trustedDevices.length > 0;
  }

  get hasChanges(): boolean {
    return (this.form.dirty && this.passwordForm.valid) || (this.passwordForm.dirty && this.passwordForm.valid);
  }

  get mfaEditorEnabled(): boolean {
    return this.isMfaEdit || (!this.isMfaEdit && this.canEdit && !this.form.get('mfaWithCountryCode').value);
  }

  get hasResetMFAPermission(): boolean {
    return this.permissionService.has(this.resetPermission);
  }

  public passwordForm: UntypedFormGroup = new UntypedFormGroup({
    oldPassword: new UntypedFormControl(''),
    newPassword: new UntypedFormControl(''),
    confirmation: new UntypedFormControl(''),
  });

  public form: UntypedFormGroup = new UntypedFormGroup({
    userName: new UntypedFormControl('', Validators.required),
    mfa: new UntypedFormControl('', [Validators.required, Validators.minLength(10)]),
    mfaCountryCode: new UntypedFormControl('', Validators.required),
    mfaWithCountryCode: new UntypedFormControl('', Validators.required),
  });

  constructor(
    private store: Store<AppState>,
    private toaster: services.ToastService,
    public oidcSecurityService: OidcSecurityService,
    private modalService: ModalService,
    private actionsSubj: ActionsSubject,
    public serverErrorService: ServerErrorService,
    public readonly permissionService: PermissionService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.store.dispatch(actions.UpdateUserProfileActionBar({
      actionBar: {
        edit: {
          ...this.editAction(),
          disabled: () => this.userProfileSettings?.mfaEnabled && !this.hasResetMFAPermission,
          permissions: PermissionService.create(PermissionTypeEnum.Users, PermissionActionTypeEnum.Edit),
        },
        back: {
          callback: () => this.back(),
          disabled: () => !this.canLeave,
        },
        save: {
          callback: () => this.checkMfaEnabled(),
          disabled: () => (this.mfaEditorEnabled && !this.isMfaValid()) || this.canLeave,
          hidden: () => !this.canEdit,
          permissions: PermissionService.create(PermissionTypeEnum.Users, PermissionActionTypeEnum.Edit),
          awaitedActionTypes: [
            actions.UpdateUserProfileSettingsSuccess.type,
            actions.UpdateUserProfileSettingsError.type,
          ],
        },
        cancel: {
          callback: () => this.cancel(),
          hidden: () => !this.canEdit,
        },
      },
    }));

    this.user$.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((user: UserInfo) => {
      this.store.dispatch(actions.GetUserProfileDetails({ id: user.id }));
    });

    this.seedUserProfileInfo();
    this.store.dispatch(actions.GetCountriesPhoneCodes());

    if (!this.userProfileSettings) {
      this.userProfileSettings = new UserSettings();
    }

    this.mfaCode$.pipe(
      filter(code => !!code),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(
      code => {
        this.mfaCode = code;
        this.save();
      },
    );

    this.mfaPhoneNumber$.pipe(
      filter(phoneNumber => !!phoneNumber),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(phoneNumber => {
      this.mfaPhoneNumber = +phoneNumber;
    });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(actions.UpdateUserProfileSettingsSuccess),
    ).subscribe(() => {
      this.form.markAsPristine();
    });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(actions.UpdateUserProfileSettingsError),
    ).subscribe(data => {
      this.serverErrorService.showServerErrors(this.passwordForm, data);
    });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(actions.UpdateUserProfileSettingsSuccess),
    ).subscribe(() => {
      this.canEdit = false;
      this.isMfaEdit = false;
    });
  }

  public seedUserProfileInfo(): void {
    this.store.select<any>(authSelectors.getUser).pipe(
      filter(user => !!user),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(user => {
      this.store.dispatch(actions.GetUserProfileSettings({ userId: user.userGuid }));
    });

    this.store.select(userProfileDetails)
      .pipe(
        filter(u => !!u),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(u => {
        this.userProfileDetails = u;
      });

    this.store.select(userProfileSettings).pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(userProfile => {
      if (userProfile) {
        this.userProfileSettings = userProfile;
        this.oidcSecurityService.getAccessToken().subscribe((token: string) => {
          this.userProfileSettings.token = token;
        });
        this.form.patchValue({
          userName: userProfile.userName,
          mfaWithCountryCode: userProfile.mfa,
        });
      }
    });
  }

  private isMfaValid(): boolean {
    const mfaNumber: string = this.form.get('mfa').value;
    const mfaCountryCode: string = this.form.get('mfaCountryCode').value;
    const mfaIsMandatory = this.userProfileSettings.mfaEnabled;
    const mfaFilled = this.form.controls.mfa.valid && this.form.controls.mfaCountryCode.valid;
    return (mfaIsMandatory && mfaFilled)
      || (!mfaIsMandatory && (mfaFilled || (mfaNumber.length === 0 && (!mfaCountryCode || mfaCountryCode.length === 0))));
  }

  private addMfa(): void {
    const mfaCountryCodeSource = this.form.controls.mfaCountryCode.value
      ? this.form.controls.mfaCountryCode.value.split('_')
      : [];
    this.form.patchValue({ mfaWithCountryCode: `${mfaCountryCodeSource.length ? mfaCountryCodeSource[0] : null}${this.form.controls.mfa.value}` });
  }

  public deleteMfa(): void {
    this.isMfaEdit = true;
    this.form.patchValue({
      mfa: '',
      mfaCountryCode: '',
      mfaWithCountryCode: '',
    });
    this.form.controls.mfa.markAsUntouched();
    this.form.markAsDirty();
  }

  public deleteDevice(index: number): void {
    this.userProfileSettings.trustedDevices.splice(index, 1);
    this.form.markAsDirty();
  }

  public checkMfaEnabled(): void {
    if (this.userProfileSettings.mfaEnabled) {
      this.sendMfaCode();
    } else {
      this.save();
    }
  }

  public sendMfaCode(): void {
    let phoneCode: string;
    let authyUpdateRequest: AuthyUpdateRequest;

    let phoneNumber: string = this.form.get('mfa').value;
    if (phoneNumber) {
      phoneCode = this.form.get('mfaCountryCode').value.split('_')[0];
      authyUpdateRequest = {
        phoneCode,
        phoneNumber,
        email: this.userProfileDetails.email,
      };
    } else {
      phoneNumber = this.form.get('mfaWithCountryCode').value;
    }

    this.modalService.show(MfaCodeModalComponent, {
      initialState: {
        title: 'Edit Security Settings',
        phoneNumberShort: phoneNumber.slice(-4),
        authyUpdateRequest,
      },
      class: 'mfa-code-modal',
    });
  }

  public save(): void {
    if (!this.form.errors && (this.passwordForm.valid || !this.passwordForm.touched)) {
      if (this.form.controls.mfa.valid && this.form.controls.mfaCountryCode.valid) {
        this.addMfa();
      }

      const requestItem: UserSettings = new UserSettings({
        userName: this.form.controls.userName.value,
        oldPassword: this.passwordForm.controls.oldPassword.value,
        newPassword: this.passwordForm.controls.newPassword.value,
        mfa: this.userProfileSettings.mfaEnabled ? this.form.controls.mfaWithCountryCode.value : null,
        mfaCode: this.mfaCode,
        userId: this.userProfileSettings.userId,
        trustedDevices: this.userProfileSettings.trustedDevices,
        phoneNumber: this.mfaPhoneNumber,
      });

      this.store.dispatch(actions.UpdateUserProfileSettingsRequest({ userSettings: requestItem }));
      this.resetPasswordForm();
    } else {
      this.form.markAllAsTouched();
      this.toaster.showWarning('Form is not valid', 'Cannot save');
      this.store.dispatch(commonActions.FormInvalid());
    }

    this.store.dispatch(SaveUserEnteredMfaCode({ code: null }));
  }

  public cancel(): void {
    if (this.canEdit) {
      this.isMfaEdit = false;
      this.canEdit = false;
      this.form.markAsPristine();
      this.seedUserProfileInfo();
      this.resetPasswordForm();
      this.passwordForm.markAsPristine();
    }
  }

  public resetPasswordForm(): void {
    this.passwordForm.patchValue({
      oldPassword: '',
      newPassword: '',
      confirmation: '',
    });
    this.passwordForm.markAsUntouched();
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public onDevicesChanged(devices): void {
    this.userProfileSettings.trustedDevices = devices;
    this.form.markAsDirty();
  }

  private back(): void {
    this.store.dispatch(commonActions.GotoParentView());
  }
}
