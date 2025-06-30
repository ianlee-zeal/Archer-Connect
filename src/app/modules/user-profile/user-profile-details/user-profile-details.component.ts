import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, ActionsSubject } from '@ngrx/store';
import { AppState } from '@app/modules/admin/user-access-policies/state/state';
import { authSelectors } from '@app/modules/auth/state';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { Editable } from '@app/modules/shared/_abstractions/editable';
import { ToastService } from '@app/services';
import { ofType } from '@ngrx/effects';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { SelectHelper } from '@app/helpers/select.helper';
import { UserInfo } from '@app/models';
import { TimeZone } from '@app/models/time-zone';
import * as commonActions from '@app/modules/shared/state/common.actions';
import { UserProfileDetails } from '@app/models/user-profile-details';
import { IUserProfileState } from '../state/reducer';
import * as actions from '../state/actions';
import * as selectors from '../state/selectors';
import * as sharedActions from '../../shared/state/drop-downs-values/actions';
import { dropDownsValuesSelectors } from '../../shared/state/drop-downs-values/selectors';

@Component({
  selector: 'app-user-profile-details',
  templateUrl: './user-profile-details.component.html',
  styleUrls: ['./user-profile-details.component.scss'],
})
export class UserProfileDetailsComponent extends Editable implements OnInit, OnDestroy {
  public form: UntypedFormGroup;
  private pristine: boolean = true;
  public userId: number;
  public existingUserProfileDetails: UserProfileDetails;

  public userProfile$ = this.userStore.select(selectors.userProfile);
  public user$ = this.store.select<any>(authSelectors.getUser);
  public actionBar$ = this.store.select(selectors.actionBar);
  public timeZones$ = this.store.select(dropDownsValuesSelectors.timeZones);
  public defaultGlobalSearchTypes$ = this.store.select(dropDownsValuesSelectors.defaultGlobalSearchTypes);
  public defaultGlobalSearchTypeOptions: SelectOption[];
  public timezoneOptions: SelectOption[];

  private timezones: TimeZone[];

  private ngUnsubscribe$ = new Subject<void>();

  protected get hasChanges(): boolean {
    if (!this.canEdit) {
      return false;
    }

    return this.form.dirty || !this.pristine;
  }

  constructor(
    private store: Store<AppState>,
    private userStore: Store<IUserProfileState>,
    private toaster: ToastService,
    private actionsSubj: ActionsSubject,
    private fb: UntypedFormBuilder,
  ) {
    super();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      firstName: [''],
      lastName: [''],
      displayName: [''],
      email: [''],
      timezone: [null],
      defaultGlobalSearch: [null],
    });

    this.store.dispatch(sharedActions.GetTimeZoneListRequest());
    this.store.dispatch(sharedActions.GetDefaultGlobalSearchTypeListRequest());

    this.store.dispatch(actions.UpdateUserProfileActionBar({
      actionBar:
      {
        back: { callback: () => { this.goBack(); } },
        edit: this.editAction(),
        save: {
          callback: () => this.save(),
          disabled: () => this.canLeave,
          hidden: () => !this.canEdit,
          awaitedActionTypes: [
            actions.SaveUserProfileDetailsCompleted.type,
            actions.Error.type,
            commonActions.FormInvalid.type,
          ],
        },
        cancel: {
          callback: () => this.cancel(),
          hidden: () => !this.canEdit,
        },
      },
    }));

    this.user$.pipe(
      filter(user => !!user),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((user: UserInfo) => {
      this.userId = user.id;
      this.store.dispatch(actions.GetUserProfileDetails({ id: this.userId }));
    });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(actions.SaveUserProfileDetailsCompleted),
    ).subscribe(() => {
      this.editModeOff();
    });

    this.defaultGlobalSearchTypes$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(options => {
        this.defaultGlobalSearchTypeOptions = SelectHelper.toOptions(options);
      });

    this.timeZones$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(timezones => {
        this.timezones = timezones;
        this.timezoneOptions = SelectHelper.toOptions(timezones, opt => opt.id, opt => opt.description);
      });

    this.userProfile$
      .pipe(
        takeUntil(this.ngUnsubscribe$),
        filter(u => !!u),
      )
      .subscribe(u => {
        this.existingUserProfileDetails = u;
        this.populateUserProfileForm(u);
      });
  }

  public get validationForm(): UntypedFormGroup {
    return this.form;
  }

  public cancel(): void {
    if (this.canEdit) {
      this.canEdit = false;
      if (this.existingUserProfileDetails) {
        this.populateUserProfileForm(this.existingUserProfileDetails);
      }
    }
  }

  public save(): void {
    if (this.validate()) {
      const { value } = this.form;

      const timezone = this.timezones.find(tz => tz.id === value.timezone || tz.id === value.timezone.id);

      const userProfile: UserProfileDetails = {
        ...value,
        userId: this.userId,
        timezone,
      };

      this.store.dispatch(actions.SaveUserProfileDetails({ userProfile, timezone }));
    } else {
      this.toaster.showWarning('Form is not valid', 'Cannot save');
      this.store.dispatch(commonActions.FormInvalid());
    }
  }

  private goBack(): void {
    if (this.canEdit) {
      this.editModeOff();
    } else {
      this.store.dispatch(commonActions.GotoParentView());
    }
  }

  private editModeOff() {
    this.canEdit = false;
    this.pristine = true;
    this.form.markAsPristine();
  }

  private populateUserProfileForm(u: UserProfileDetails) {
    this.form.patchValue({
      firstName: u.firstName,
      lastName: u.lastName,
      displayName: u.displayName,
      email: u.email,
      timezone: u.timezone?.id,
      defaultGlobalSearch: u.defaultGlobalSearch,
    });
    this.form.updateValueAndValidity();
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
