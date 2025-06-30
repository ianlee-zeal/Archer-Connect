import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActionsSubject, Store } from '@ngrx/store';
import { Validators, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { ValidationService } from '@app/services/validation.service';
import { TimeZone, User } from '@app/models';
import { FormsStateService } from '@app/services/forms-state.service';
import { Editable } from '@app/modules/shared/_abstractions/editable';
import { dropDownsValuesSelectors } from '@app/modules/shared/state/drop-downs-values/selectors';
import { SelectHelper } from '@app/helpers/select.helper';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { StringHelper } from '@app/helpers';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';
import * as fromUserAccessPolicesState from '../../state/state';
import * as sharedActions from '../../../../shared/state/drop-downs-values/actions';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { UserProfilePageComponent } from '../user-profile-page/user-profile-page.component';
import { ofType } from '@ngrx/effects';
import * as commonActions from '@shared/state/common.actions';

interface IUserFormValue {
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  displayName: string;
  timeZone: TimeZone;
  isActive: boolean;
  isTwoFactorEnabled: boolean;
  employeeId: string;
}

@Component({
  selector: 'userGeneralInfo',
  templateUrl: 'user-general-info-page.component.html',
  styleUrls: ['./user-general-info-page.styles.scss'],
})
export class UserGeneralInfoPageComponent extends Editable implements OnInit, OnDestroy {
  readonly userInfo$ = this.store.select(selectors.currentUser);
  readonly userDetailsForm$ = this.store.select(selectors.userDetailsForm);
  readonly canViewEmployeeDetails = this.permissionService.has(PermissionService.create(PermissionTypeEnum.Users, PermissionActionTypeEnum.EmployeeDetails));
  readonly canViewTeams = this.permissionService.has([PermissionService.create(PermissionTypeEnum.Users, PermissionActionTypeEnum.Read),
                                                      PermissionService.create(PermissionTypeEnum.Users, PermissionActionTypeEnum.Teams)]);
  public timeZones$ = this.store.select(dropDownsValuesSelectors.timeZones);
  public userForm: UntypedFormGroup;

  public timezoneOptions: SelectOption[];
  private ngUnsubscribe = new Subject<void>();
  protected readonly canToggleMFA = PermissionService.create(PermissionTypeEnum.Users, PermissionActionTypeEnum.DisableMFA);

  protected get validationForm(): UntypedFormGroup {
    return this.userForm;
  }

  public get hasChanges(): boolean {
    return this.userForm.dirty;
  }

  constructor(
    private store: Store<fromUserAccessPolicesState.AppState>,
    private formBuilder: UntypedFormBuilder,
    private formStateService: FormsStateService,
    private readonly permissionService: PermissionService,
    private readonly actionsSubj: ActionsSubject,
    private parent: UserProfilePageComponent,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.store.dispatch(sharedActions.GetTimeZoneListRequest());

    this.userForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.maxLength(255)]],
      lastName: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.required, ValidationService.emailValidator, Validators.maxLength(120)]],
      userName: ['', [Validators.required, ValidationService.noWhitespaceValidator, Validators.maxLength(240)]],
      displayName: ['', [Validators.required, Validators.maxLength(255)]],
      timeZone: [''],
      isActive: [''],
      isTwoFactorEnabled: [],
      employeeId: [null],
    });

    this.userForm.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((formValue: IUserFormValue) => {
        const userUpdater: Partial<User> = {
          ...formValue,
          employeeId: StringHelper.parseInt(formValue.employeeId),
        };

        this.store.dispatch(actions.UpdateUser({
          user: userUpdater as User,
          userDetailsForm: Object.assign(this.userForm),
        }));
      });

    this.userInfo$
      .pipe(
        filter(formData => !!formData),
        takeUntil(this.ngUnsubscribe),
      )
      .subscribe(formData => {
        this.userForm.patchValue(formData, { onlySelf: true, emitEvent: false });
      });

    this.userDetailsForm$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(formState => {
        this.formStateService.restoreFormState(formState, this.userForm);

        if (!formState) {
          this.validationForm.markAsPristine();
        }
      });

    this.timeZones$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(timezones => {
        this.timezoneOptions = SelectHelper.toOptions(timezones, opt => opt.id, opt => opt.description);
      });

    this.parent.actionBarActionHandlersForDetails = {
      ...this.parent.actionBarActionHandlersForDetails,
      save: {
        callback: () => this.parent.saveUser(),
        disabled: () => this.canLeave,
        hidden: () => !this.canEdit,
        permissions: PermissionService.create(PermissionTypeEnum.Users, PermissionActionTypeEnum.Edit),
        awaitedActionTypes: [
          actions.SaveUserCompleted.type,
          actions.Error.type,
          commonActions.FormInvalid.type,
        ],
      },
      edit: {
        callback: () => this.edit(),
        hidden: () => this.canEdit && this.parent.hasEdited,
        permissions: PermissionService.create(PermissionTypeEnum.Users, PermissionActionTypeEnum.Edit),
      },
      cancel: {
        callback: () => this.cancel(),
        hidden: () => !this.canEdit,
        permissions: PermissionService.create(PermissionTypeEnum.Users, PermissionActionTypeEnum.Edit),
      },
      back: {
        callback: () => this.parent.back(),
        disabled: () => !this.canLeave,
      },
    }

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe),
      ofType(
        actions.SaveUserCompleted,
      ),
    ).subscribe(() => {
      this.canEdit = false;
      this.isSavePerformed = true;
      this.parent.initialUser = null;
    });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe),
      ofType(
        actions.Error,
      ),
    ).subscribe(() => {
      this.cancel();
      this.isSavePerformed = false;
    });
  }

  protected edit(): void {
      this.canEdit = true;
      this.parent.hasEdited = true;
      this.isSavePerformed = false;
  }

  private cancel() {
    this.store.dispatch(actions.UpdateUser({ user: this.parent.initialUser, userDetailsForm: null }));
    this.parent.hasEdited = false;
    this.canEdit = false;
  }

  public validate(): boolean {
    return super.validate();
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
