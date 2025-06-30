import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { PermissionGuard } from '../auth/permission-guard';
import { AccountingInvoiceItemsComponent } from './accounting-invoice-items/accounting-invoice-items.component';

const routes: Routes = [
  {
    path: '',
    component: AccountingInvoiceItemsComponent,
    canActivate: [PermissionGuard],
    data: { permissions: [PermissionService.create(PermissionTypeEnum.AccountingDetails, PermissionActionTypeEnum.Read)] },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountingRoutingModule { }
