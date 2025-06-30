import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionGuard } from '../auth/permission-guard';
import { DocumentBatchListViewComponent } from './document-batch-list-view/document-batch-list-view.component';
import { DocumentBatchViewComponent } from './document-batch-view/document-batch-view.component';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { DocumentBatchDetailsComponent } from './document-batch-details/document-batch-details.component';
import * as uuid from 'uuid';
import { DocumentBatchDetailsSectionComponent } from './document-batch-details-section/document-batch-details-section.component';
import { DocumentBatchDetailsFilesComponent } from './document-batch-details/document-batch-details-files/document-batch-details-files.component.';

const routes: Routes = [
  {
    path: '',
    component: DocumentBatchListViewComponent,
    canActivate: [PermissionGuard],
    data: {
      permissions: [
              PermissionService.create(PermissionTypeEnum.DocumentBatch, PermissionActionTypeEnum.Read),
            ],
    },
  },
  {
    path: 'upload',
    component: DocumentBatchViewComponent,
    canActivate: [PermissionGuard],
    data: {
      permissions: [
              PermissionService.create(PermissionTypeEnum.DocumentBatch, PermissionActionTypeEnum.Create),
            ],
    },
  },
  {
    path: 'details/:id',
    component: DocumentBatchDetailsComponent,
    canActivate: [PermissionGuard],
    data: {
      componentId: uuid.v4(),
      permissions: [
        PermissionService.create(PermissionTypeEnum.DocumentBatch, PermissionActionTypeEnum.Read),
      ],
    },
    children: [
      {
        path: '',
        component: DocumentBatchDetailsSectionComponent,
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'tabs' },
          {
            path: 'tabs',
            children: [
              { path: '', pathMatch: 'full', redirectTo: 'batch-details' },
              { path: 'batch-details', component: DocumentBatchDetailsFilesComponent },
            ],
          },
        ],
      },
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentBatchRoutingModule { }
