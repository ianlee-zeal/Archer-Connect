import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Store } from '@ngrx/store';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { AccessPolicy } from '@app/models/access-policy';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { PermissionService, ToastService } from '@app/services';
import { autoFocusFieldAsyncValidator } from '@app/validators/auto-focus-field.validator';
import { FormInvalid } from '@app/modules/shared/state/common.actions';
import { OrganizationRoleState } from '../state/reducers';
import * as accessPoliciesSelectors from '../../access-policies/state/selectors';
import * as accessPoliciesActions from '../../access-policies/state/actions';
import * as actions from '../state/actions';
import * as selectors from '../state/selectors';
import * as fromAuth from '@app/modules/auth/state';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { UserInfo } from '@app/models';
import { RoleLevelEnum } from '@app/models/enums/role-level.enum';


@Component({
  selector: 'app-roles-add-new-modal',
  templateUrl: './roles-add-new-modal.component.html',
  styleUrls: ['./roles-add-new-modal.component.scss'],
})
export class RolesAddNewModalComponent extends ValidationForm implements OnInit, OnDestroy {
  private ngUnsubscribe$ = new Subject<void>();
  public ngDestroyed$ = new Subject<void>();

  public orgId: number;
  public orgRoleForm: UntypedFormGroup;
  public orgAccessPolicies: AccessPolicy[];
  public orgAccessPolicyOptions: SelectOption[];
  public error: string;
  public isMaster = false;
  public levelOptions: { name: string, id: number }[];

  public error$ = this.store.select(selectors.error);
  public orgAccessPolicies$ = this.store.select(accessPoliciesSelectors.accessPoliciesIndex);

  private readonly user$ = this.store.select(fromAuth.authSelectors.getUser);

  protected get validationForm(): UntypedFormGroup {
    return this.orgRoleForm;
  }

  readonly awaitedActionTypes = [
    actions.CreateOrganizationRoleSuccess.type,
    actions.CreateOrganizationRoleError.type,
    FormInvalid.type,
  ];

  constructor(
    private fb: UntypedFormBuilder,
    public addNewOrgRoleModal: BsModalRef,
    private store: Store<OrganizationRoleState>,
    private toaster: ToastService,
    private readonly permissionService: PermissionService,
  ) {
    super();

    this.levelOptions = [
      { name: RoleLevelEnum[RoleLevelEnum.Organization], id: RoleLevelEnum.Organization },
      { name: RoleLevelEnum[RoleLevelEnum.Global], id: RoleLevelEnum.Global },
    ];
  }

  ngOnInit() {
    this.store.dispatch(accessPoliciesActions.GetAccessPolicies({ orgId: this.orgId }));

    this.user$.pipe(
      filter((user: UserInfo) => !!user),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((user: UserInfo) => {
      this.isMaster = user.defaultOrganization?.isMaster;
      this.configureForm();
      this.orgRoleForm.controls.level.setValue(RoleLevelEnum.Organization);
    });

    this.orgAccessPolicies$.pipe(
      filter(accessPolicies => !!accessPolicies),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(accessPolicies => {
      this.orgAccessPolicies = accessPolicies;
      this.orgAccessPolicyOptions = accessPolicies.map(policy => ({
        id: policy.id,
        name: policy.nameWithPolicyLevel,
      }));
      this.orgRoleForm.controls.accessPolicyId.setValue(this.orgAccessPolicies[0].id);
    });

    this.error$.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(errorMessage => {
      this.error = errorMessage;
    });
  }

  public onRoleLevelChange(event: RoleLevelEnum): void {
    const isGlobalLevel = event === RoleLevelEnum.Global;
    const filteredPolicies = isGlobalLevel
      ? this.orgAccessPolicies.filter(policy => policy.policyLevel.name === RoleLevelEnum[RoleLevelEnum.Global])
      : this.orgAccessPolicies;

    this.orgAccessPolicyOptions = filteredPolicies.map(policy => ({
      id: policy.id,
      name: policy.nameWithPolicyLevel,
    }));

    if (this.orgAccessPolicyOptions.length > 0) {
      this.orgRoleForm.controls.accessPolicyId.setValue(this.orgAccessPolicyOptions[0].id);
    }
  }

  private configureForm(): void {
    this.orgRoleForm = this.fb.group({
      roleName: ['', [], autoFocusFieldAsyncValidator],
      level: [],
      accessPolicyId: null,
    });
  }

  public hasRoleLevelPermission(): boolean {
    return this.permissionService.has(PermissionService.create(PermissionTypeEnum.Roles, PermissionActionTypeEnum.SetRoleLevel));
  }

  onSave() {
    if (super.validate()) {
      this.store.dispatch(actions.CreateOrganizationRoleRequest({
        name: this.orgRoleForm.value.roleName,
        accessPolicyId: this.orgRoleForm.value.accessPolicyId,
        modal: this.addNewOrgRoleModal,
        orgId: this.orgId,
        level: this.orgRoleForm.value.level
      }));
    } else {
      this.toaster.showWarning('Form is not valid', 'Cannot save');
      this.store.dispatch(FormInvalid());
    }
  }

  public ngOnDestroy(): void {
    if (this.error) {
      this.store.dispatch(actions.ClearError());
    }

    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
