import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import * as uuid from 'uuid';

import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { CommunicationRelatedDocumentsComponent } from './communication/communication-related-documents/communication-related-documents.component';
import { CommunicationViewEditPageComponent } from './communication/communication-view-edit-page/communication-view-edit-page.component';
import { CommunicationViewCreatePageComponent } from './communication/communication-view-create-page/communication-view-create-page.component';
import { CommunicationNotesPageComponent } from './communication/communication-notes-page/communication-notes-page.component';
import { PermissionGuard } from '../auth/permission-guard';
import { CanDeactivateGuard } from '../shared/_guards/can-deactivate.guard';

const canReadCommunicationNotesPermission = PermissionService.create(PermissionTypeEnum.CommunicationNotes, PermissionActionTypeEnum.Read);

const routes: Routes = [
  {
    path: '',
    data: { componentId: uuid.v4() },
    children: [
      {
        path: 'new',
        component: CommunicationViewCreatePageComponent,
        data: { componentId: uuid.v4() },
        canDeactivate: [CanDeactivateGuard],
        children: [
          {
            path: '',
            children: [
              {
                path: '',
                pathMatch: 'full',
                redirectTo: 'notes',
              },
              {
                path: 'notes',
                component: CommunicationNotesPageComponent,
                canActivate: [PermissionGuard],
                data: { permissions: [canReadCommunicationNotesPermission] },
              },
              {
                path: 'related-documents',
                component: CommunicationRelatedDocumentsComponent,
              },
            ],
          },
        ],
      },
      {
        path: ':id',
        component: CommunicationViewEditPageComponent,
        canActivate: [PermissionGuard],
        data: {
          componentId: uuid.v4(),
          permissions: [PermissionService.create(PermissionTypeEnum.ClientCommunications, PermissionActionTypeEnum.Read)]
        },
        canDeactivate: [CanDeactivateGuard],
        children: [
          {
            path: '',
            children: [
              {
                path: '',
                pathMatch: 'full',
                redirectTo: 'notes',
              },
              {
                path: 'notes',
                component: CommunicationNotesPageComponent,
                canActivate: [PermissionGuard],
                data: { permissions: [canReadCommunicationNotesPermission] },
              },
              {
                path: 'related-documents',
                component: CommunicationRelatedDocumentsComponent,
              },
            ],
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CallCenterRoutingModule { }
