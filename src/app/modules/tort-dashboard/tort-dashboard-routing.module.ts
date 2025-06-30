import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionGuard } from '@app/modules/auth/permission-guard';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { TortDashboardComponent } from './tort-dashboard/tort-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: TortDashboardComponent,
    canActivate: [PermissionGuard],
    data: {
      permissions: [
              PermissionService.create(PermissionTypeEnum.TortDashboard, PermissionActionTypeEnum.TalcDashboard),
            ],
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TortDashboardRoutingModule { }
