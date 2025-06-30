import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FirmLandingPageComponent } from '@app/modules/firm-landing-page/firm-landing-page.component';
import { PermissionGuard } from '@app/modules/auth/permission-guard';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import {
  GlobalDeficienciesComponent
} from '@app/modules/firm-landing-page/global-deficiencies/global-deficiencies.component';

const routes: Routes = [
  {
    path: '',
    component: FirmLandingPageComponent,
    canActivate: [PermissionGuard],
    data: { permissions: [PermissionService.create(PermissionTypeEnum.FirmLandingPage, PermissionActionTypeEnum.Read)] },
  },
  {
    path: 'global-deficiencies',
    component: GlobalDeficienciesComponent,
    canActivate: [PermissionGuard],
    data: { permissions: [PermissionService.create(PermissionTypeEnum.GlobalDeficiencies, PermissionActionTypeEnum.Read)] },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FirmLandingPageRoutingModule { }
