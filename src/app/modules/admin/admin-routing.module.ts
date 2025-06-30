import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import * as uuid from 'uuid';

import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { UserAccessPoliciesDetailComponent } from './user-access-policies/access-policies/user-access-policies-detail/user-access-policies-detail.component';
import { OrgAccessIndexComponent } from './org-access-index/org-access-index.component';
import { UserListComponent } from '../shared/user-list/user-list.component';
import { PermissionListPageComponent } from './perms/permission-list-page/permission-list-page.component';
import { UserAccessPoliciesIndexComponent } from '../shared/user-access-policies-index/user-access-policies-index.component';
import { CanDeactivateGuard } from '../shared/_guards/can-deactivate.guard';
import { PermissionGuard } from '../auth/permission-guard';
import { UserAccessPoliciesPermissionsComponent } from './user-access-policies/access-policies/user-access-policies-permissions/user-access-policies-permissions.component';
import { UserAccessPoliciesComponent } from './user-access-policies/access-policies/user-access-policies/user-access-policies.component';
import { UploadW9Component } from './upload-w9/upload-form/upload-w9.component';

const routes: Routes = [
  {
    path: 'user/users',
    component: UserListComponent,
    canActivate: [PermissionGuard],
    data: { permissions: [PermissionService.create(PermissionTypeEnum.Users, PermissionActionTypeEnum.Read)] },
  },
  {
    path: 'user/roles',
    component: UserAccessPoliciesIndexComponent,
    canActivate: [PermissionGuard],
    data: { permissions: [PermissionService.create(PermissionTypeEnum.UserRoles, PermissionActionTypeEnum.Read)] },
  },
  {
    path: 'user/roles/:id',
    component: UserAccessPoliciesComponent,
    canActivate: [PermissionGuard],
    data: {
      permissions: [PermissionService.create(PermissionTypeEnum.UserRoles, PermissionActionTypeEnum.Read)],
      componentId: uuid.v4(),
    },
    children: [
      { path: '', redirectTo: 'tabs', pathMatch: 'full' },
      {
        path: 'tabs',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'details' },
          { path: 'details', component: UserAccessPoliciesDetailComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'permissions', component: UserAccessPoliciesPermissionsComponent },
        ],
      },
    ],
  },
  {
    path: 'upload-w9',
    component: UploadW9Component,
    canActivate: [PermissionGuard],
    data: {
      permissions: [
              PermissionService.create(PermissionTypeEnum.Upload_W9, PermissionActionTypeEnum.Create),
            ],
    },
  },
  { path: 'user/orgs', loadChildren: () => import('./user-access-policies/orgs/user-access-policies-orgs.module').then(m => m.UserAccessPoliciesOrgsModule) },

  { path: 'org/access', component: OrgAccessIndexComponent },
  { path: 'org/roles', loadChildren: () => import('./user-access-policies/roles/roles.module').then(m => m.RolesModule) },

  {
    path: 'perm/org',
    component: PermissionListPageComponent,
    canActivate: [PermissionGuard],
    data: { permissions: [PermissionService.create(PermissionTypeEnum.Organizations, PermissionActionTypeEnum.Read)] },
  },
  { path: 'bank-accounts', loadChildren: () => import('./bank-accounts/bank-accounts.module').then(m => m.BankAccountsModule) },
  { path: 'contract-rule-templates', loadChildren: () => import('./billing-rule-templates/billing-rule-templates.module').then(m => m.BillingRuleTemplatesModule) },
  { path: 'task-templates', loadChildren: () => import('./task-templates/task-templates.module').then(m => m.TaskTemplatesModule) },
  { path: 'workflow-commands', loadChildren: () => import('./workflow-commands/workflow-commands.module').then(m => m.WorkflowCommandsModule) },
  { path: 'maintenance-mode', loadChildren: () => import('./maintenance-mode/maintenance-mode.module').then(m => m.MaintenanceModeModule) },
  { path: '', redirectTo: 'claimants', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule { }
