import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from '@app/modules/auth/permission-guard';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { MaintenanceModePageComponent } from './maintenance-mode-page/maintenance-mode-page.component';

const routes: Routes = [
  {
    path: '',
    component: MaintenanceModePageComponent,
    canActivate: [PermissionGuard],
    data: { permissions: [PermissionService.create(PermissionTypeEnum.MaintenanceMode, PermissionActionTypeEnum.Read)] },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MaintenanceModeRoutingModule { }
