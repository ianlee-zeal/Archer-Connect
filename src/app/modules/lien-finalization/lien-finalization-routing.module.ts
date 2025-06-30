import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import * as uuid from 'uuid';
import { PermissionGuard } from '@app/modules/auth/permission-guard';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { LienFinalizationGridComponent } from './lien-finalization-grid/lien-finalization-grid.component';
import { LienFinalizationComponent } from './lien-finalization.component';
import { FinalizationDetailsComponent } from './finalization-details/finalization-details.component';
import { LienFinalizationDetailsSectionComponent } from './sections/lien-finalization-details-section.component';
import { FinalizationDetailsGridComponent } from './finalization-details/finalization-details-grid/finalization-details-grid.component';

const routes: Routes = [
  {
    path: '',
    component: LienFinalizationComponent,
    canActivate: [PermissionGuard],
    data: {
      permissions: [
        PermissionService.create(PermissionTypeEnum.LienFinalizationTool, PermissionActionTypeEnum.Read),
      ],
    },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'tabs' },
      {
        path: 'tabs',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'lien-finalization' },
          { path: 'lien-finalization', pathMatch: 'full', component: LienFinalizationGridComponent },
        ],
      },
    ],
  },
  {
    path: 'tabs/lien-finalization/:id',
    canActivate: [PermissionGuard],
    data: { componentId: uuid.v4() },
    component: FinalizationDetailsComponent,
    children: [
      {
        path: '',
        component: LienFinalizationDetailsSectionComponent,
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'tabs' },
          {
            path: 'tabs',
            children: [
              { path: '', pathMatch: 'full', redirectTo: 'finalization-details' },
              { path: 'finalization-details', component: FinalizationDetailsGridComponent },
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
export class LienFinalizationRoutingModule { }
