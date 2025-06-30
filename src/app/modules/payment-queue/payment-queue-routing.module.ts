import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { PermissionGuard } from '../auth/permission-guard';
import { GlobalPaymentQueueListComponent } from './payment-queue-list/payment-queue-list.component';
import { PaymentQueueSectionComponent } from './payment-queue-section.component';

const routes: Routes = [
  {
    path: '',
    component: PaymentQueueSectionComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'tabs' },
      {
        path: 'tabs',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'list' },
          {
            path: 'list',
            canActivate: [PermissionGuard],
            data: {
              permissions: [
                PermissionService.create(PermissionTypeEnum.GlobalPaymentQueue, PermissionActionTypeEnum.Read),
              ],
            },
            children: [
              { path: '', component: GlobalPaymentQueueListComponent },
              {
                path: 'saved-search',
                children: [
                  {
                    path: ':id',
                    component: GlobalPaymentQueueListComponent,
                    canActivate: [PermissionGuard],
                    data: {
                      permissions: [
                        PermissionService.create(PermissionTypeEnum.GlobalPaymentQueue, PermissionActionTypeEnum.Read),
                      ],
                      clearGridFilters: true,
                    },
                  },
                ],
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
export class PaymentQueueRoutingModule { }
