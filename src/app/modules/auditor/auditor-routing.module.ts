import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import * as uuid from 'uuid';

import { PermissionGuard } from '@app/modules/auth/permission-guard';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { AuditBatchesComponent } from './audit-batches/audit-batches.component';
import { AuditDetailsComponent } from './audit-batches/audit-details/audit-details.component';
import { AuditorComponent } from './auditor.component';
import { AuditBatchDetailsSectionComponent } from './sections/audit-batch-details-section.component';
import { AuditClaimsListComponent } from './audit-batches/audit-details/audit-claims/audit-claims-list.component';

const routes: Routes = [
  {
    path: '',
    component: AuditorComponent,
    canActivate: [PermissionGuard],
    data: {
      permissions: [
        PermissionService.create(PermissionTypeEnum.DataProcessingAuditor, PermissionActionTypeEnum.Read),
      ],
    },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'tabs' },
      {
        path: 'tabs',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'audit-batches' },
          { path: 'audit-batches', pathMatch: 'full', component: AuditBatchesComponent },
        ],
      },
    ],
  },
  {
    path: 'tabs/audit-batches/:id',
    canActivate: [PermissionGuard],
    data: { componentId: uuid.v4() },
    component: AuditDetailsComponent,
    children: [
      {
        path: '',
        component: AuditBatchDetailsSectionComponent,
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'tabs' },
          {
            path: 'tabs',
            children: [
              { path: '', pathMatch: 'full', redirectTo: 'audit-details' },
              { path: 'audit-details', component: AuditClaimsListComponent },
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
export class AuditorRoutingModule { }
