import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import * as uuid from 'uuid';
import { PermissionGuard } from '@app/modules/auth/permission-guard';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { MattersComponent } from './matters/matters.component';
import { MatterDetailsComponent } from './matter-details/matter-details.component';
import { RelatedSettlementListComponent } from './matter-details/related-settlements/related-settlements-list.component';
import { MatterTabsComponent } from './matter-details/matter-tabs/matter-tabs.component';
import { MatterInformationComponent } from './matter-details/matterInformation/matter-information.component';
import { MatterNotesComponent } from './matter-details/matter-notes/matter-notes.component';
import { MatterDocumentsComponent } from './matter-details/matter-documents/matter-documents.component';

const routes: Routes = [
  {
    path: '',
    component: MattersComponent,
    canActivate: [PermissionGuard],
    data: {
      permissions: [
        PermissionService.create(PermissionTypeEnum.Matters, PermissionActionTypeEnum.Read),
      ],
    },
  },
  {
    path: ':id',
    component: MatterDetailsComponent,
    canActivate: [PermissionGuard],
    data: {
      componentId: uuid.v4(),
      permissions: [
        PermissionService.create(PermissionTypeEnum.Matters, PermissionActionTypeEnum.Read),
      ],
    },
    children: [
      {
        path: '',
        component: MatterTabsComponent,
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'tabs' },
          {
            path: 'tabs',
            children: [
              { path: '', pathMatch: 'full', redirectTo: 'matter-information' },
              {
                path: 'matter-information',
                component: MatterInformationComponent,
              },
              {
                path: 'matter-notes',
                component: MatterNotesComponent,
              },
              {
                path: 'related-settlements',
                component: RelatedSettlementListComponent,
              },
              {
                path: 'matter-documents',
                component: MatterDocumentsComponent,
              },
            ],
          }],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MattersRoutingModule { }
