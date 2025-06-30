import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { PermissionGuard } from '../auth/permission-guard';

import { DocumentTemplatesPageComponent } from './document-templates-page/document-templates-page.component';

const routes: Routes = [
  {
    path: '',
    component: DocumentTemplatesPageComponent,
    canActivate: [PermissionGuard],
    data: {
      permissions: [
        PermissionService.create(PermissionTypeEnum.Templates, PermissionActionTypeEnum.Read),
      ],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentTemplatesRoutingModule { }
