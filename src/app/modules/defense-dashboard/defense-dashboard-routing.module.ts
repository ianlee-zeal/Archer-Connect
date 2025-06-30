import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionGuard } from '@app/modules/auth/permission-guard';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { DefenseDashboardComponent } from './defense-dashboard/defense-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: DefenseDashboardComponent,
    canActivate: [PermissionGuard],
    data: {
      permissions: [
              PermissionService.create(PermissionTypeEnum.DefenseDashboard, PermissionActionTypeEnum.TalcDefenseDashboard),
            ],
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DefenseDashboardRoutingModule { }
