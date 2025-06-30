import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import * as uuid from 'uuid';

import { RolesListComponent } from '@app/modules/shared/roles-list/roles-list.component';
import { RolesDetailComponent } from './roles-detail/roles-detail.component';
import { RoleDetailsTabComponent } from './roles-detail/role-details-tab/role-details-tab.component';
import { CanDeactivateGuard } from '@app/modules/shared/_guards/can-deactivate.guard';
import { PermissionGuard } from '@app/modules/auth/permission-guard';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';

const routes: Routes = [
  {
    path: '',
    component: RolesListComponent,
    canActivate: [PermissionGuard],
    data: {
      permissions: [PermissionService.create(PermissionTypeEnum.Roles, PermissionActionTypeEnum.Read)],
    },
  },
  {
    path: ':id',
    component: RolesDetailComponent,
    canActivate: [PermissionGuard],
    data: {
      permissions: [PermissionService.create(PermissionTypeEnum.Roles, PermissionActionTypeEnum.Read)],
      componentId: uuid.v4(),
    },
    children: [
      { path: '', redirectTo: 'tabs', pathMatch: 'full' },
      {
        path: 'tabs',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'details' },
          { path: 'details', component: RoleDetailsTabComponent, canDeactivate: [CanDeactivateGuard] },
        ],
      },
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RolesRoutingModule { }
