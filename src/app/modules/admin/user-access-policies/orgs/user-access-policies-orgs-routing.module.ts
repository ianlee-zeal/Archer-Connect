import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import * as uuid from 'uuid';

import { CanDeactivateGuard } from '@app/modules/shared/_guards/can-deactivate.guard';
import { PermissionGuard } from '@app/modules/auth/permission-guard';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { OrgListComponent } from './org-list/org-list.component';
import { OrgProfileComponent } from './org-profile/org-profile.component';
import { OrgDetailComponent } from './org-detail/org-detail.component';
import { OrgTypesListComponent } from './org-types-list/org-types-list.component';
import { OrgAddressesComponent } from './org-addresses/org-addresses.component';
import { OrgDocumentsComponent } from './org-documents/org-documents.component';
import { OrgNotesComponent } from './org-notes/org-notes.component';
import { OrgSideNavComponent } from './org-side-nav/org-side-nav.component';
import { OrgUsersComponent } from './org-users/org-users.component';
import { OrgAccessPoliciesComponent } from './org-access-policies/org-access-policies.component';
import { SubOrganizationComponent } from './org-sub-organization/sub-organization.component';
import { UserProfilePageComponent } from '../users/user-profile-page/user-profile-page.component';
import { UserGeneralInfoPageComponent } from '../users/user-general-info-page/user-general-info-page.component';
import { UserRolesPageComponent } from '../users/user-roles-page/user-roles-page.component';
import { UserAccessPoliciesComponent } from '../access-policies/user-access-policies/user-access-policies.component';
import { UserAccessPoliciesDetailComponent } from '../access-policies/user-access-policies-detail/user-access-policies-detail.component';
import { UserAccessPoliciesPermissionsComponent } from '../access-policies/user-access-policies-permissions/user-access-policies-permissions.component';
import { MyOrganizationSectionComponent } from './sections/my-organization-section.component';
import { OrgPortalAccessComponent } from './org-portal-access/org-portal-access.component';

const myOrgSectionChildren: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tabs' },
  {
    path: 'tabs',
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'details',
      },
      {
        path: 'details',
        component: OrgDetailComponent,
        canDeactivate: [CanDeactivateGuard],
      },
      {
        path: 'types',
        component: OrgTypesListComponent,
        canDeactivate: [CanDeactivateGuard],
        data: { permissions: PermissionService.create(PermissionTypeEnum.OrganizationTypes, PermissionActionTypeEnum.Read) },
      },
      {
        path: 'addresses',
        component: OrgAddressesComponent,
        canActivate: [PermissionGuard],
        data: { permissions: PermissionService.create(PermissionTypeEnum.OrganizationAddresses, PermissionActionTypeEnum.Read) },
      },
      {
        path: 'documents',
        component: OrgDocumentsComponent,
        canActivate: [PermissionGuard],
        data: { permissions: PermissionService.create(PermissionTypeEnum.OrganizationDocuments, PermissionActionTypeEnum.Read) },
      },
      {
        path: 'notes',
        component: OrgNotesComponent,
        canActivate: [PermissionGuard],
        data: { permissions: PermissionService.create(PermissionTypeEnum.OrganizationNotes, PermissionActionTypeEnum.Read) },
      },
      {
        path:'portal-access',
        component: OrgPortalAccessComponent,
        canActivate: [PermissionGuard],
        data: { permissions: PermissionService.create(PermissionTypeEnum.OrgPortalAccess, PermissionActionTypeEnum.Read) },
      }
    ],
  },
];

const routes: Routes = [
  {
    path: '',
    component: OrgListComponent,
    canActivate: [PermissionGuard],
    data: {
      permissions: [
        PermissionService.create(PermissionTypeEnum.GlobalOrganizationSearch, PermissionActionTypeEnum.Read),
        PermissionService.create(PermissionTypeEnum.Organizations, PermissionActionTypeEnum.Read),
      ],
    },
  },
  {
    path: ':id',
    component: OrgSideNavComponent,
    canActivate: [PermissionGuard],
    data: {
      componentId: uuid.v4(),
      permissions: [
        PermissionService.create(PermissionTypeEnum.GlobalOrganizationSearch, PermissionActionTypeEnum.Read),
        PermissionService.create(PermissionTypeEnum.Organizations, PermissionActionTypeEnum.Read),
      ],
    },
    children: [{
      path: '',
      component: OrgProfileComponent,
      children: [{
        path: '',
        pathMatch: 'full',
        redirectTo: 'my-organization',
      },
      {
        path: 'my-organization',
        component: MyOrganizationSectionComponent,
        children: myOrgSectionChildren,
      }],
    },
    {
      path: 'users',
      component: OrgUsersComponent,
      canActivate: [PermissionGuard],
      data: { permissions: [PermissionService.create(PermissionTypeEnum.Users, PermissionActionTypeEnum.Read)] },
    },
    {
      path: 'users/:id',
      component: UserProfilePageComponent,
      canActivate: [PermissionGuard],
      data: {
        permissions: [PermissionService.create(PermissionTypeEnum.Users, PermissionActionTypeEnum.Read)],
        componentId: uuid.v4(),
      },
      children: [
        { path: '', redirectTo: 'tabs', pathMatch: 'full' },
        {
          path: 'tabs',
          children: [
            { path: '', pathMatch: 'full', redirectTo: 'details' },
            { path: 'details', component: UserGeneralInfoPageComponent, canDeactivate: [CanDeactivateGuard] },
            {
              path: 'roles',
              component: UserRolesPageComponent,
              canActivate: [PermissionGuard],
              data: { permissions: [PermissionService.create(PermissionTypeEnum.UserRoles, PermissionActionTypeEnum.Read)] },
            },
          ],
        },
      ],
    },
    {
      path: 'payment-instructions',
      loadChildren: () => import('../../bank-accounts/bank-accounts.module').then(m => m.BankAccountsModule),
    },
    { path: 'roles', loadChildren: () => import('../roles/roles.module').then(m => m.RolesModule) },
    {
      path: 'access-policies',
      component: OrgAccessPoliciesComponent,
      canActivate: [PermissionGuard],
      data: { permissions: [PermissionService.create(PermissionTypeEnum.AccessPolicies, PermissionActionTypeEnum.Read)] },
    },
    {
      path: 'access-policies/:id',
      component: UserAccessPoliciesComponent,
      canActivate: [PermissionGuard],
      data: {
        permissions: [PermissionService.create(PermissionTypeEnum.AccessPolicies, PermissionActionTypeEnum.Read)],
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
      path: 'sub-organization',
      component: SubOrganizationComponent,
    },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserAccessPoliciesOrgsRoutingModule { }
