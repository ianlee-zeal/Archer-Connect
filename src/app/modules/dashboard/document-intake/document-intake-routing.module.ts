import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PermissionGuard } from '@app/modules/auth/permission-guard';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { DocumentIntakeComponent } from './document-intake/document-intake.component';

const routes: Routes = [
  {
    path: '',
    component: DocumentIntakeComponent,
    canActivate: [PermissionGuard],
    data: {
      permissions: [
        PermissionService.create(PermissionTypeEnum.DocumentIntake, PermissionActionTypeEnum.Read),
      ],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentIntakeRoutingModule { }
