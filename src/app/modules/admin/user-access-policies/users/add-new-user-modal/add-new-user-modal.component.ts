import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ofType } from '@ngrx/effects';
import { filter, takeUntil } from 'rxjs/operators';
import { Store, ActionsSubject, Action } from '@ngrx/store';
import { ValidationService } from '@app/services/validation.service';

import { Subject } from 'rxjs';
import { PermissionService, ServerErrorService, ToastService } from '@app/services';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { CreateUserRequest } from '@app/models/users/create-user.request';
import { autoFocusFieldAsyncValidator } from '@app/validators/auto-focus-field.validator';
import { FormInvalid } from '../../../../shared/state/common.actions';
import * as fromUserAccessPolicesState from '../../state/state';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';

@Component({
  selector: 'app-add-new-user-modal',
  templateUrl: './add-new-user-modal.component.html',
  styleUrls: ['./add-new-user-modal.component.scss'],
})
export class AddNewUserModalComponent extends ValidationForm implements OnInit, OnDestroy {
  public title: string;
  public orgId: number;
  public onSaveFinished: Function;
  public userForm: UntypedFormGroup;
  public errorMessage$ = this.store.select(selectors.error);
  public ngDestroyed$ = new Subject<void>();
  readonly roles$ = this.store.select(selectors.organizationRoles);

  protected readonly canToggleMFA = PermissionService.create(PermissionTypeEnum.Users, PermissionActionTypeEnum.DisableMFA);


  readonly awaitedActionTypes = [
    actions.CreateNewUserSuccess.type,
    actions.CreateNewUserError.type,
    FormInvalid.type,
  ];

  public roleOptions: SelectOption[] = [];
  public selectedRoles: SelectOption[] = [];

  protected get validationForm(): UntypedFormGroup {
    return this.userForm;
  }

  constructor(
    private fb: UntypedFormBuilder,
    public addNewUserModal: BsModalRef,
    public serverErrorService: ServerErrorService,
    private actionsSubj: ActionsSubject,
    private store: Store<fromUserAccessPolicesState.AppState>,
    private toaster: ToastService,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.store.dispatch(actions.GetOrganizationRolesForUserCreation({ orgId: this.orgId }));
    this.userForm = this.fb.group({
      firstName: ['', [Validators.maxLength(122), ValidationService.onlyAlphabetics], autoFocusFieldAsyncValidator],
      lastName: ['', [Validators.required, Validators.maxLength(122), ValidationService.onlyAlphabetics]],
      email: ['', [Validators.required, ValidationService.emailValidator, Validators.maxLength(120)]],
      roleIds: [[], [Validators.required, Validators.minLength(1)]],
      isTwoFactorEnabled: [true],
    });

    this.actionsSubj.pipe(
      takeUntil(this.ngDestroyed$),
      ofType(actions.CreateNewUserError),
    ).subscribe(data => {
      this.serverErrorService.showServerErrors(this.userForm, data);
    });

    this.roles$.pipe(
      filter(roles => !!roles),
      takeUntil(this.ngDestroyed$),
    ).subscribe(roles => {
      this.roleOptions = [...roles.map(role => ({ id: role.id, name: role.name }))];
    });
  }

  updateSelectedRoles(value: SelectOption[]): void {
    this.selectedRoles = value;
    this.roleOptions = this.roleOptions.map(item => (
      { ...item, checked: value.includes(item) }
    ));
    this.userForm.controls.roleIds.setValue(value.map(item => Number(item.id)));
  }

  public ngOnDestroy(): void {
    this.store.dispatch(actions.ResetCreateUserState());
  }

  public createCallback(): void {
    if (!this.errorMessage$) this.onCancel();
  }

  public onCancel(): void {
    this.store.dispatch(actions.ResetCreateUserState());
    this.addNewUserModal.hide();
  }

  public onSave(): void {
    if (!super.validate()) {
      this.toaster.showWarning('Form is not valid', 'Cannot save');
      this.store.dispatch(FormInvalid());
      return;
    }

    const user = this.userForm.getRawValue() as CreateUserRequest;
    user.orgId = this.orgId;
    this.store.dispatch(actions.CreateNewUserRequest({ user, successCallback: this.createCallback() }));
  }

  onSaveActionFinished(action: Action = null) {
    if (action.type === actions.CreateNewUserSuccess.type) {
      this.onSaveFinished();
    }
  }
}
