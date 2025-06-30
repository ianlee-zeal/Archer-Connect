import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PermissionGuard } from '@app/modules/auth/permission-guard';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { DocumentsComponent } from './documents.component';
import { DocumentsSearchComponent } from './documents-search/documents-search.component';
import { DocumentTypesComponent } from './document-types/document-types.component';

const routes: Routes = [
  {
    path: '',
    component: DocumentsComponent,
    canActivate: [PermissionGuard],
    data: {
      permissions: [
        PermissionService.create(PermissionTypeEnum.GlobalDocumentSearch, PermissionActionTypeEnum.Read),
        PermissionService.create(PermissionTypeEnum.Documents, PermissionActionTypeEnum.Read),
      ],
    },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'tabs' },
      {
        path: 'tabs',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'documents-list' },
          { path: 'documents-list', component: DocumentsSearchComponent },
          {
            path: 'document-types',
            component: DocumentTypesComponent,
            data: {
              permissions: [
                PermissionService.create(PermissionTypeEnum.DocumentType, PermissionActionTypeEnum.Read),
              ],
            },
          },
        ],
      }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentsRoutingModule { }
