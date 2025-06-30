import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PermissionGuard } from '@app/modules/auth/permission-guard';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { PaymentsSectionComponent } from './payments-section/payments-section.component';
import { PaymentsGridComponent } from './payments-grid/payments-grid.component';
import { PaymentDetailsComponent } from './payment-details/payment-details.component';
import { PaymentDetailsPageComponent } from './payment-details-page/payment-details-page.component';
import { CheckVerificationListComponent } from './check-verification-list/check-verification-list.component';
import { PaymentItemDetailListComponent } from './payment-item-detail-list/payment-item-detail-list.component';
import { TransfersGridComponent } from './transfers-grid/transfers-grid.component';
import { TransferDetailsPageComponent } from './transfer-details-page/transfer-details-page.component';
import { TransferDetailsComponent } from './transfer-details/transfer-details.component';
import { TransferItemDetailListComponent } from './transfer-item-detail-list/transfer-item-detail-list.component';

const routes: Routes = [
  {
    path: 'payments',
    component: PaymentsSectionComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'tabs' },
      {
        path: 'tabs',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'payments' },
          {
            path: 'payments',
            component: PaymentsGridComponent,
            canActivate: [PermissionGuard],
            data: {
              permissions: [
                PermissionService.create(PermissionTypeEnum.Payments, PermissionActionTypeEnum.Read),
                PermissionService.create(PermissionTypeEnum.GlobalPaymentSearch, PermissionActionTypeEnum.Read),
              ],
            },
          },
          {
            path: 'transfers',
            component: TransfersGridComponent,
            canActivate: [PermissionGuard],
            data: {
              permissions: [
                PermissionService.create(PermissionTypeEnum.FeatureFlag, PermissionActionTypeEnum.TransferToSubAccount),
              ],
            },
            // children: [
            //   {
            //     path: ':id',
            //     component: TransferRequestListComponent,
            //     data: {
            //       permissions: [
            //         PermissionService.create(PermissionTypeEnum.FeatureFlag, PermissionActionTypeEnum.TransferToSubAccount),
            //       ],
            //     },
            //   },
            // ],
          }
        ],
      },
    ],
  },
  {
    path: 'payments/:id',
    component: PaymentDetailsPageComponent,
    canActivate: [PermissionGuard],
    data: {
      permissions: [
        PermissionService.create(PermissionTypeEnum.Payments, PermissionActionTypeEnum.Read),
      ],
    },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'tabs' },
      {
        path: 'tabs',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'details' },
          {
            path: 'details',
            component: PaymentDetailsComponent,
            canActivate: [PermissionGuard],
            data: {
              permissions: [
                PermissionService.create(PermissionTypeEnum.Payments, PermissionActionTypeEnum.Read),
              ],
            },
          },
          {
            path: 'check-verification',
            component: CheckVerificationListComponent,
            canActivate: [PermissionGuard],
            data: {
              permissions: [
                PermissionService.create(PermissionTypeEnum.CheckVerification, PermissionActionTypeEnum.Read),
              ],
            },
          },
          {
            path: 'payment-item-details',
            component: PaymentItemDetailListComponent,
            canActivate: [PermissionGuard],
            data: {
              permissions: [
                PermissionService.create(PermissionTypeEnum.Payments, PermissionActionTypeEnum.Read),
              ],
            },
          },
        ],
      },
    ],
  },
  {
    path: 'transfers/:id',
    component: TransferDetailsPageComponent,
    canActivate: [PermissionGuard],
    data: {
      permissions: [
        PermissionService.create(PermissionTypeEnum.Payments, PermissionActionTypeEnum.Read),
      ],
    },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'tabs' },
      {
        path: 'tabs',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'details' },
          {
            path: 'details',
            component: TransferDetailsComponent,
            canActivate: [PermissionGuard],
            data: {
              permissions: [
                PermissionService.create(PermissionTypeEnum.Payments, PermissionActionTypeEnum.Read),
              ],
            },
          },
          {
            path: 'transfer-item-details',
            component: TransferItemDetailListComponent,
            canActivate: [PermissionGuard],
            data: {
              permissions: [
                PermissionService.create(PermissionTypeEnum.Payments, PermissionActionTypeEnum.Read),
              ],
            },
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
export class PaymentsRoutingModule { }
