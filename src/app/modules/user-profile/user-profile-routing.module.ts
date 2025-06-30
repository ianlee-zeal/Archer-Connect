import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import * as uuid from 'uuid';

import { UserProfileGeneralTabComponent } from './user-profile-general-tab/user-profile-general-tab.component';
import { TabPlaceholderUnderConstructionComponent } from '../shared/tab-placeholder/tab-placeholder-under-construction/tab-placeholder-under-construction.component';
import { UserProfileDetailsComponent } from './user-profile-details/user-profile-details.component';
import { UserProfileLogInHistoryTabComponent } from './user-profile-log-in-history-tab/user-profile-log-in-history-tab.component';
import { UserProfileSideNavComponent } from './user-side-nav/user-profile-side-nav.component';
import { UserProfileRolesTabComponent } from './user-profile-roles-tab/user-profile-roles-tab.component';
import { UserProfileSubscriptionsTabComponent } from './user-profile-subscriptions-tab/user-profile-subscriptions-tab.component';
import { SecuritySettingsComponent } from './security-settings/security-settings.component';
import { UserProfileSectionComponent } from './user-profile-section/user-profile-section.component';
import { CanDeactivateGuard } from '../shared/_guards/can-deactivate.guard';
import { UserProfilePermissionsComponent } from './user-profile-permissions/user-profile-permissions.component';
import { UserPermissionsSectionComponent } from './user-profile-section/user-permissions-section.component';
import { UserProfilePermissionsSideNavComponent } from './user-side-nav/user-profile-permissioms-side-nav.component';

const routes: Routes = [
  {
    path: '',
    component: UserProfileGeneralTabComponent,
    children: [
      {
        path: '',
        component: UserProfileSideNavComponent,
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'details' },
          {
            path: 'details',
            component: UserProfileSectionComponent,
            data: { componentId: uuid.v4() },
            children: [
              { path: '', pathMatch: 'full', redirectTo: 'tabs' },
              {
                path: 'tabs',
                children: [
                  { path: '', pathMatch: 'full', redirectTo: 'details' },
                  { path: 'details', component: UserProfileDetailsComponent, canDeactivate: [CanDeactivateGuard] },
                  { path: 'security-settings', component: SecuritySettingsComponent, canDeactivate: [CanDeactivateGuard] },
                  { path: 'roles', component: UserProfileRolesTabComponent },
                  { path: 'subscriptions', component: UserProfileSubscriptionsTabComponent },
                  { path: 'actions', component: UserProfileLogInHistoryTabComponent },
                ],
              },
            ],
          },
          { path: 'tasks', component: TabPlaceholderUnderConstructionComponent },
        ],
      },
      {
        path: 'permissions',
        component: UserProfilePermissionsSideNavComponent,
        children: [
          {
            path: '',
            component: UserPermissionsSectionComponent,
            children: [
              { path: '', pathMatch: 'full', redirectTo: 'tabs' },
              {
                path: 'tabs',
                children: [
                  { path: '', pathMatch: 'full', redirectTo: 'permissions' },
                  { path: 'permissions', component: UserProfilePermissionsComponent },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserProfileRoutingModule { }
