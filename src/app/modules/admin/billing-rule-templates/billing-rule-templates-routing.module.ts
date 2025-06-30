import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { PermissionGuard } from '@app/modules/auth/permission-guard';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { BillingRuleTemplatesListComponent } from './billing-rule-templates-list/billing-rule-templates-list.component';
import { BillingRuleTemplateDetailsComponent } from './billing-rule-template-details/billing-rule-template-details.component';

const routes: Routes = [
  {
    path: '',
    component: BillingRuleTemplatesListComponent,
    canActivate: [PermissionGuard],
    data: { permissions: [PermissionService.create(PermissionTypeEnum.BillingRuleTemplate, PermissionActionTypeEnum.Read)] },
  },
  {
    path: 'new',
    component: BillingRuleTemplateDetailsComponent,
    canActivate: [PermissionGuard],
    data: { permissions: [PermissionService.create(PermissionTypeEnum.BillingRuleTemplate, PermissionActionTypeEnum.Read)] },
  },
  {
    path: ':id',
    component: BillingRuleTemplateDetailsComponent,
    canActivate: [PermissionGuard],
    data: { permissions: [PermissionService.create(PermissionTypeEnum.BillingRuleTemplate, PermissionActionTypeEnum.Read)] },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BillingRuleTemplatesRoutingModule { }
