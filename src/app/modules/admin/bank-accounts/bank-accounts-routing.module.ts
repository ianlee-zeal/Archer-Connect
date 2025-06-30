import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import * as uuid from 'uuid';

import { BankAccountsListComponent } from '@app/modules/shared/bank-accounts-list/bank-accounts-list.component';
import { CanDeactivateGuard } from '@app/modules/shared/_guards/can-deactivate.guard';
import { PermissionGuard } from '@app/modules/auth/permission-guard';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PaymentPreferencesListComponent } from '@app/modules/shared/payment-preferences-list/payment-preferences-list.component';
import { BankAccountGeneralTabComponent } from './bank-account-general-tab/bank-account-general-tab.component';
import { BankAccountPaymentsHistoryComponent } from './bank-account-payments-history/bank-account-payments-history.component';
import { BankAccountAuditLogsComponent } from './bank-account-audit-logs/bank-account-audit-logs.component';
import { BankAccountsCreateComponent } from './bank-accounts-create/bank-accounts-create.component';
import { BankAccountDetailsComponent } from './bank-account-details/bank-account-details.component';
import { BankAccountsNotesComponent } from './bank-accounts-notes/bank-accounts-notes.component';
import { PaymentInstructionsSectionComponent } from './sections/payment-instructions-section';
import { OrgPaymentSettingsComponent } from './org-payment-settings/org-payment-settings.component';

const routes: Routes = [
  {
    path: '',
    component: PaymentInstructionsSectionComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'tabs' },
      {
        path: 'tabs',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'bank-accounts' },
          {
            path: 'bank-accounts',
            component: BankAccountsListComponent,
            canActivate: [PermissionGuard],
            data: { permissions: [PermissionService.create(PermissionTypeEnum.BankAccounts, PermissionActionTypeEnum.Read)] },
          },
          {
            path: 'payment-instructions',
            component: PaymentPreferencesListComponent,
            canActivate: [PermissionGuard],
            data: {
              permissions: [
                PermissionService.create(PermissionTypeEnum.OrganizationPaymentInstruction, PermissionActionTypeEnum.Read),
              ],
            },
          },
          {
            path: 'payment-settings',
            component: OrgPaymentSettingsComponent,
            canActivate: [PermissionGuard],
            data: {
              permissions: [
                PermissionService.create(PermissionTypeEnum.OrganizationPaymentInstruction, PermissionActionTypeEnum.Read),
              ],
            },
          },
          {
            path: 'documents',
            loadChildren: () => import('./org-payment-documents/payment-instruction-documents.module').then(m => m.PaymentInstructionDocumentsModule),
            canActivate: [PermissionGuard],
            data: {
              permissions: [
                PermissionService.create(PermissionTypeEnum.Documents, PermissionActionTypeEnum.Read),
              ],
            },
          },
        ],
      }],
  },
  {
    path: 'new',
    component: BankAccountsCreateComponent,
    canActivate: [PermissionGuard],
    data: {
      componentId: uuid.v4(),
      permissions: [PermissionService.create(PermissionTypeEnum.BankAccounts, PermissionActionTypeEnum.Create)],
    },
  },
  {
    path: ':id',
    component: BankAccountGeneralTabComponent,
    canActivate: [PermissionGuard],
    data: {
      componentId: uuid.v4(),
      permissions: [PermissionService.create(PermissionTypeEnum.BankAccounts, PermissionActionTypeEnum.Read)],
    },
    children: [
      { path: '', redirectTo: 'tabs', pathMatch: 'full' },
      {
        path: 'tabs',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'details' },
          { path: 'details', component: BankAccountDetailsComponent, canDeactivate: [CanDeactivateGuard] },
          { path: 'payments-history', component: BankAccountPaymentsHistoryComponent },
          { path: 'audit-logs', component: BankAccountAuditLogsComponent },
          {
            path: 'notes',
            component: BankAccountsNotesComponent,
            data: { permissions: [PermissionService.create(PermissionTypeEnum.BankAccountNotes, PermissionActionTypeEnum.Read)] },
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
export class BankAccountsRoutingModule { }
