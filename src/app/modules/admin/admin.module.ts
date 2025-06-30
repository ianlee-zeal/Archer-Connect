/* eslint-disable import/no-cycle */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AgGridModule } from 'ag-grid-angular';

import { PaymentsModule } from '@app/modules/payments/payments.module';
import { reducer } from './state/reducer';
import { UserRoleOrgEffects } from './user-access-policies/orgs/state/effects';
import { PermissionEffects } from './perms/state/effects';
import { AccessPoliciesEffects } from './user-access-policies/access-policies/state/effects';

import { AdminRoutingModule } from './admin-routing.module';
import { OrgAccessIndexComponent } from './org-access-index/org-access-index.component';
import { UserAccessPoliciesDetailComponent } from './user-access-policies/access-policies/user-access-policies-detail/user-access-policies-detail.component';
import { SharedModule } from '../shared/shared.module';
import { AddNewUserModalComponent } from './user-access-policies/users/add-new-user-modal/add-new-user-modal.component';

import { UserProfilePageComponent } from './user-access-policies/users/user-profile-page/user-profile-page.component';
import { UserGeneralInfoPageComponent } from './user-access-policies/users/user-general-info-page/user-general-info-page.component';

import { PermissionListPageComponent } from './perms/permission-list-page/permission-list-page.component';
import { UserRolesPageComponent } from './user-access-policies/users/user-roles-page/user-roles-page.component';
import { UserServerStatusOperationComponent } from './user-access-policies/users/user-server-status-operation/user-server-status-operation.component';
import { AddNewRoleModalComponent } from './user-access-policies/users/add-new-role-modal/add-new-role-modal.component';
import { OrgAccessPoliciesComponent } from './user-access-policies/orgs/org-access-policies/org-access-policies.component';
import { UserAccessPoliciesPermissionsComponent } from './user-access-policies/access-policies/user-access-policies-permissions/user-access-policies-permissions.component';
import { UsersEffects } from './user-access-policies/users/state/effects';
import { PermissionsGridComponent } from './user-access-policies/access-policies/user-access-policies-permissions/permissions-grid/permissions-grid.component';
import { ModalFieldPermissionsComponent } from './user-access-policies/access-policies/user-access-policies-permissions/modal-field-permissions/modal-field-permissions.component';
import { OrgsButtonsRendererComponent } from './user-access-policies/orgs/renderers/orgs-buttons-renderer';
import { AddNewAccessPolicyModalComponent } from './user-access-policies/access-policies/add-new-access-policy-modal/add-new-access-policy-modal.component';
import { AddressesModule } from '../addresses/addresses.module';
import { UserAccessPoliciesComponent } from './user-access-policies/access-policies/user-access-policies/user-access-policies.component';
import { RolesModule } from './user-access-policies/roles/roles.module';
import { AdvancedPermissionsGridComponent } from './user-access-policies/access-policies/user-access-policies-permissions/advanced-permissions-grid/advanced-permissions-grid.component';
import { FieldPermissionsGridComponent } from './user-access-policies/access-policies/user-access-policies-permissions/field-permissions-grid/field-permissions-grid.component';
import { UserTeamsGridComponent } from './user-access-policies/users/user-teams-grid/user-teams-grid.component';
import { CreateOrEditUserTeamDialogComponent } from './user-access-policies/users/user-teams-grid/dialogs/create-or-edit-user-team-dialog/create-or-edit-user-team-dialog.component';
import { UserTeamsGridActionsRendererComponent } from './user-access-policies/users/user-teams-grid/renderers/user-teams-grid-actions-renderer/user-teams-grid-actions-renderer.component';
import { UploadW9Component } from './upload-w9/upload-form/upload-w9.component';
import { UploadProgressModalComponent } from './upload-w9/upload-progress-modal/upload-progress-modal.component';
import { UploadW9Effects } from './upload-w9/state/effects';

@NgModule({
  declarations: [
    OrgAccessIndexComponent,
    OrgsButtonsRendererComponent,
    UserAccessPoliciesDetailComponent,
    AddNewUserModalComponent,
    UserProfilePageComponent,
    UserGeneralInfoPageComponent,
    UserRolesPageComponent,
    PermissionListPageComponent,
    UserServerStatusOperationComponent,
    OrgAccessPoliciesComponent,
    UserAccessPoliciesPermissionsComponent,
    ModalFieldPermissionsComponent,
    PermissionsGridComponent,
    AddNewRoleModalComponent,
    AddNewAccessPolicyModalComponent,
    UserAccessPoliciesComponent,
    AdvancedPermissionsGridComponent,
    FieldPermissionsGridComponent,
    UserTeamsGridComponent,
    CreateOrEditUserTeamDialogComponent,
    UserTeamsGridActionsRendererComponent,
    UploadW9Component,
    UploadProgressModalComponent,
  ],
  imports: [
    CommonModule,
    FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    AdminRoutingModule,
    SharedModule,
    AddressesModule,
    PaymentsModule,
    RolesModule,
    ModalModule.forRoot(),
    AgGridModule,
    StoreModule.forFeature('admin_feature', reducer),
    EffectsModule.forFeature([UsersEffects, UserRoleOrgEffects, AccessPoliciesEffects, PermissionEffects, UploadW9Effects]),
  ],
  exports: [
    PermissionsGridComponent,
  ],
})
export class AdminModule { }
