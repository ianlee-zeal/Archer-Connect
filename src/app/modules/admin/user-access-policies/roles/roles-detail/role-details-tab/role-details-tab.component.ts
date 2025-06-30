import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Validators, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { combineLatestWith, distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { Editable } from '@app/modules/shared/_abstractions/editable';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { OrgRole } from '@app/models/org-role';
import { MessageService, PermissionService } from '@app/services';
import { GotoParentView } from '@shared/state/common.actions';
import * as services from '@app/services';
import * as userAccessPoliciesActions from '@app/modules/admin/user-access-policies/access-policies/state/actions';
import * as userAccessPoliciesSelectors from '@app/modules/admin/user-access-policies/access-policies/state/selectors';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import * as actions from '../../state/actions';
import * as selectors from '../../state/selectors';
import * as fromOrgs from '@app/modules/admin/user-access-policies/orgs/state';
import * as fromAuth from '@app/modules/auth/state';

import { OrganizationRoleState } from '../../state/reducers';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { RoleLevelEnum } from '@app/models/enums/role-level.enum';
import { UserInfo } from '@app/models/users/user-info';

@Component({
  selector: 'app-role-details-tab',
  templateUrl: './role-details-tab.component.html',
  styleUrls: ['./role-details-tab.component.scss'],
})
export class RoleDetailsTabComponent extends Editable implements OnInit, OnDestroy {
  public accessPolicies$ = this.store.select(userAccessPoliciesSelectors.accessPoliciesIndex);
  private ngUnsubscribe$ = new Subject<void>();
  public currentRoleLevel: RoleLevelEnum;
  private shouldDisableActions = false;

  private actionBar: ActionHandlersMap = {
    edit: {
      ...this.editAction(),
      disabled: () => this.shouldDisableActions,
      permissions: PermissionService.create(PermissionTypeEnum.Roles, PermissionActionTypeEnum.Edit),
    },
    save: {
      callback: () => this.onSave(),
      hidden: () => !this.canEdit,
      disabled: () => !this.hasChanges,
      permissions: PermissionService.create(PermissionTypeEnum.Roles, PermissionActionTypeEnum.Edit),
      awaitedActionTypes: [
        actions.SaveOrgRoleSuccess.type,
        actions.Error.type,
      ],
    },
    delete: {
      callback: () => this.onDelete(),
      disabled: () => this.shouldDisableActions,
      permissions: PermissionService.create(PermissionTypeEnum.Roles, PermissionActionTypeEnum.Delete),
    },
    back: {
      callback: () => this.onCancel(),
      disabled: () => !this.canLeave,
    },
    cancel: {
      callback: () => this.onCancel(),
      hidden: () => !this.canEdit,
    },
  };

  public orgRole$ = this.store.select(selectors.orgRole);
  public orgRoleForm: UntypedFormGroup;
  public orgRoleModel: OrgRole;
  public orgAccessPolicyOptions: SelectOption[];
  public orgId$ = this.store.select(fromOrgs.orgId);
  public orgId: number;
  private readonly user$ = this.store.select(fromAuth.authSelectors.getUser);

  protected get validationForm(): UntypedFormGroup {
    return this.orgRoleForm;
  }

  get hasChanges(): boolean {
    return this.orgRoleForm.dirty && !this.orgRoleForm.pristine;
  }

  constructor(
    private store: Store<OrganizationRoleState>,
    private formBuilder: UntypedFormBuilder,
    private toaster: services.ToastService,
    private messageService: MessageService,
    private readonly permissionService: PermissionService,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.orgRoleForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      accessPolicyId: null,
    });

    this.orgId$.pipe(
      filter(org => !!org),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(id => {
      this.orgId = id;
    });

    this.orgRole$
    .pipe(
      filter(item => !!item),
      distinctUntilChanged((prev, curr) => prev.id === curr.id), // Ensures distinct orgRole values by id
      takeUntil(this.ngUnsubscribe$),
      combineLatestWith(
        this.user$.pipe(
          filter((user: UserInfo) => !!user),
          distinctUntilChanged((prev, curr) => prev.defaultOrganization?.isMaster === curr.defaultOrganization?.isMaster) // Ensures distinct user values by isMaster property
        )
      ),
      map(([orgRole, user]) => {
        const shouldDisableActions = orgRole.organizationId == null && !(user.defaultOrganization?.isMaster && this.canSetGlobalRoleLevel());
        return { orgRole, shouldDisableActions };
      })
    )
    .subscribe(({ orgRole, shouldDisableActions }) => {
      // Update the component state
      this.orgRoleModel = orgRole;
      this.orgRoleForm.patchValue(orgRole);
      this.shouldDisableActions = shouldDisableActions;

      // Dispatch the action to get access policies if necessary
      this.store.dispatch(userAccessPoliciesActions.GetAccessPolicies({ orgId: orgRole.organizationId }));
    });


    this.accessPolicies$
      .pipe(
        filter(policies => !!policies),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(policies => {
        this.orgAccessPolicyOptions = policies
          .filter(policy =>
            this.orgRoleModel?.organizationId
              ? true
              : policy.policyLevel.name === RoleLevelEnum[RoleLevelEnum.Global]
          )
          .map(policy => ({
            id: policy.id,
            name: policy.nameWithPolicyLevel,
          }));
      });

    this.store.dispatch(actions.UpdateOrgRoleActionBar({ actionBar: this.actionBar }));
  }

  public canSetGlobalRoleLevel(): boolean {
    return this.permissionService.has(PermissionService.create(PermissionTypeEnum.Roles, PermissionActionTypeEnum.SetRoleLevel));
  }

  public onSave(): void {
    if (super.validate()) {
      super.save();
      this.store.dispatch(actions.SaveOrgRoleRequest({
        callback: () => {
          this.canEdit = false;
          this.orgRoleForm.markAsPristine();
        },
      }));
    } else {
      this.toaster.showWarning('Form is not valid', 'Cannot save');
    }
  }

  public onChange(): void {
    this.store.dispatch(actions.UpdateOrgRoleFormState({ orgRole: this.orgRoleForm.value }));
    this.orgRoleForm.markAsDirty();
  }

  private onDelete(): void {
    this.messageService.showDeleteConfirmationDialog(
      'Confirm delete',
      'Are you sure you want to delete selected Organization Role?',
    )
      .subscribe(answer => {
        if (answer) {
          this.delete();
        }
      });
  }

  private delete(): void {
    this.store.dispatch(actions.DeleteOrganizationRolesRequest({
      ids: [this.orgRoleModel.id],
      orgId: this.orgRoleModel.organizationId ? this.orgRoleModel.organizationId : this.orgId,
      callback: () => this.store.dispatch(GotoParentView()),
    }));
  }

  public onCancel(): void {
    if (this.canEdit) {
      this.canEdit = false;
      this.orgRoleForm.markAsPristine();
      this.store.dispatch(actions.GetOrganizationRoleDetailsRequest({ id: this.orgRoleModel.id }));
    } else {
      this.store.dispatch(GotoParentView());
    }
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
