import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PermissionGuard } from '@app/modules/auth/permission-guard';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { LienDeficienciesGridComponent } from './lien-deficiencies-grid/lien-deficiencies-grid.component';
import { LienDeficienciesComponent } from './lien-deficiencies.component';
import { LienDeficienciesManagementGridComponent } from './lien-deficiencies-management-grid/lien-deficiencies-management-grid.component';

const routes: Routes = [
  {
    path: '',
    component: LienDeficienciesComponent,
    canActivate: [PermissionGuard],
    data: {
      permissions: [
        PermissionService.create(PermissionTypeEnum.Integrations, PermissionActionTypeEnum.Read),
      ],
    },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'tabs' },
      {
        path: 'tabs',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'lien-deficiencies' },
          { path: 'lien-deficiencies', pathMatch: 'full', component: LienDeficienciesGridComponent },
          { path: 'lien-deficiencies-management', pathMatch: 'full', component: LienDeficienciesManagementGridComponent },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LienDeficienciesRoutingModule { }
