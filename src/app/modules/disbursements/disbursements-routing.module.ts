import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PermissionGuard } from '@app/modules/auth/permission-guard';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { DisbursementsListComponent } from './disbursements-list/disbursements-list.component';
import { DisbursementsSectionComponent } from './disbursements-section.component';
import { StopPaymentRequestListComponent } from './stop-payment-request-list/stop-payment-request-list.component';
import { TransferRequestListComponent } from './transfer-request-list/transfer-request-list.component'

const routes: Routes = [

  {
    path: '',
    component: DisbursementsSectionComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'tabs' },
      {
        path: 'tabs',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'payment-requests' },
          {
            path: 'payment-requests',
            component: DisbursementsListComponent,
            canActivate: [PermissionGuard],
            data: {
              permissions: [
                PermissionService.create(PermissionTypeEnum.GlobalDisbursementSearch, PermissionActionTypeEnum.Read),
              ],
            },
            children: [
              {
                path: ':id',
                component: DisbursementsListComponent,
                data: {
                  permissions: [
                    PermissionService.create(PermissionTypeEnum.GlobalDisbursementSearch, PermissionActionTypeEnum.Read),
                  ],
                },
              },
            ],
          },
          {
            path: 'transfer-requests',
            component: TransferRequestListComponent,
            canActivate: [PermissionGuard],
            data: {
              permissions: [
                PermissionService.create(PermissionTypeEnum.FeatureFlag, PermissionActionTypeEnum.TransferToSubAccount),
              ],
            },
            children: [
              {
                path: ':id',
                component: TransferRequestListComponent,
                data: {
                  permissions: [
                    PermissionService.create(PermissionTypeEnum.FeatureFlag, PermissionActionTypeEnum.TransferToSubAccount),
                  ],
                },
              },
            ],
          },
          {
            path: 'stop-payment-requests',
            component: StopPaymentRequestListComponent,
            canActivate: [PermissionGuard],
            data: {
              permissions: [
                PermissionService.create(PermissionTypeEnum.StopPaymentRequest, PermissionActionTypeEnum.Read),
              ],
            },
            children: [
              {
                path: ':id',
                component: StopPaymentRequestListComponent,
                data: {
                  permissions: [
                    PermissionService.create(PermissionTypeEnum.GlobalDisbursementSearch, PermissionActionTypeEnum.Read),
                  ],
                },
              },
            ],
          },

        ],
      }],
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DisbursementsRoutingModule { }
