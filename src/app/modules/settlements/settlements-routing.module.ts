import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import * as uuid from 'uuid';

import { CanDeactivateGuard } from '@app/modules/shared/_guards/can-deactivate.guard';
import { PermissionGuard } from '@app/modules/auth/permission-guard';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { SettlementInfoTabComponent } from './settlement-details/settlement-info-tab/settlement-info-tab.component';
import { SettlementsListComponent } from './settlements-list/settlements-list.component';
import { SettlementDetailsComponent } from './settlement-details/settlement-details.component';
import { SettlementNotesTabComponent } from './settlement-details/settlement-notes-tab/settlement-notes-tab.component';
import { SettlementDocumentsTabComponent } from './settlement-details/settlement-documents-tab/settlement-documents-tab.component';
import { SettlementProjectsTabComponent } from './settlement-details/settlement-projects-tab/settlement-projects-tab.component';
import { SettlementClaimantsTabComponent } from './settlement-details/settlement-claimants-tab/settlement-claimants-tab.component';
import { SettlementOverviewSectionComponent } from './settlement-details/settlement-overview/settlement-overview-section.component';
import { FinancialSummaryTabComponent } from './settlement-details/financial-summary-tab/financial-summary-tab.component';

const routes: Routes = [
  {
    path: '',
    component: SettlementsListComponent,
    canActivate: [PermissionGuard],
    data: {
      permissions: [
        PermissionService.create(PermissionTypeEnum.GlobalSettlementSearch, PermissionActionTypeEnum.Read),
        PermissionService.create(PermissionTypeEnum.Settlements, PermissionActionTypeEnum.Read),
      ],
    },
  },
  {
    path: ':id',
    component: SettlementDetailsComponent,
    data: { componentId: uuid.v4() },
    children: [
      {
        path: '',
        component: SettlementOverviewSectionComponent,
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'tabs' },
          {
            path: 'tabs',
            children: [
              { path: '', pathMatch: 'full', redirectTo: 'details' },
              {
                path: 'details',
                component: SettlementInfoTabComponent,
                canDeactivate: [CanDeactivateGuard],
                canActivate: [PermissionGuard],
                data: {
                  permissions: [
                    PermissionService.create(PermissionTypeEnum.GlobalSettlementSearch, PermissionActionTypeEnum.Read),
                    PermissionService.create(PermissionTypeEnum.Settlements, PermissionActionTypeEnum.Read),
                  ],
                },
              },
              {
                path: 'notes',
                component: SettlementNotesTabComponent,
                canActivate: [PermissionGuard],
                data: {
                  permissions: [
                    PermissionService.create(PermissionTypeEnum.SettlementNotes, PermissionActionTypeEnum.Read),
                  ],
                },
              },
              {
                path: 'documents',
                component: SettlementDocumentsTabComponent,
                canActivate: [PermissionGuard],
                data: {
                  permissions: [
                    PermissionService.create(PermissionTypeEnum.SettlementDocuments, PermissionActionTypeEnum.Read),
                  ],
                },
              },
              {
                path: 'projects',
                component: SettlementProjectsTabComponent,
                canActivate: [PermissionGuard],
                data: {
                  permissions: [
                    PermissionService.create(PermissionTypeEnum.Settlements, PermissionActionTypeEnum.Read),
                    PermissionService.create(PermissionTypeEnum.Projects, PermissionActionTypeEnum.Read),
                  ],
                },
              },
              {
                path: 'claimants',
                component: SettlementClaimantsTabComponent,
                canActivate: [PermissionGuard],
                data: {
                  permissions: [
                    PermissionService.create(PermissionTypeEnum.Settlements, PermissionActionTypeEnum.Read),
                    PermissionService.create(PermissionTypeEnum.Clients, PermissionActionTypeEnum.Read),
                  ],
                },
              },
              {
                path: 'financial-summary',
                component: FinancialSummaryTabComponent,
                canActivate: [PermissionGuard],
                data: {
                  permissions: [
                    PermissionService.create(PermissionTypeEnum.Settlements, PermissionActionTypeEnum.Read),
                    PermissionService.create(PermissionTypeEnum.Settlements, PermissionActionTypeEnum.FinancialSummary),
                  ],
                },
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
export class SettlementsRoutingModule { }
