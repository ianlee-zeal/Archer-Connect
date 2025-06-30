/* eslint-disable import/no-cycle */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EffectsModule } from '@ngrx/effects';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AgGridModule } from 'ag-grid-angular';

import { SharedModule } from '@app/modules/shared/shared.module';
import { AddressesModule } from '@app/modules/addresses/addresses.module';
import { OrgListComponent } from './org-list/org-list.component';
import { OrgProfileComponent } from './org-profile/org-profile.component';
import { OrgDetailComponent } from './org-detail/org-detail.component';
import { OrgTypesListComponent } from './org-types-list/org-types-list.component';
import { OrgAddressesComponent } from './org-addresses/org-addresses.component';
import { OrgDocumentsComponent } from './org-documents/org-documents.component';

import { UserRoleOrgEffects } from './state/effects';
import { UserAccessPoliciesOrgsRoutingModule } from './user-access-policies-orgs-routing.module';
import { OrgNotesComponent } from './org-notes/org-notes.component';
import { AddNewOrgModalComponent } from './add-new-org-modal/add-new-org-modal.component';
import { OrgSideNavComponent } from './org-side-nav/org-side-nav.component';
import { OrgUsersComponent } from './org-users/org-users.component';
import { AdminModule } from '../../admin.module';
import { OrgBanksComponent } from './org-banks/org-banks.component';
import { OrgRolesComponent } from './org-roles/org-roles.component';
import { SubOrganizationComponent } from './org-sub-organization/sub-organization.component';
import { BankAccountsModule } from '../../bank-accounts/bank-accounts.module';
import { SubOrgListEffects } from './state/org-sub-organization/effects';
import { MyOrganizationSectionComponent } from './sections/my-organization-section.component';
import { OrgPortalAccessComponent } from './org-portal-access/org-portal-access.component';
import { GenerateUserLoginReportModalComponent } from './org-list/generate-user-login-report-modal/generate-user-login-report-modal.component';

@NgModule({
  declarations: [
    MyOrganizationSectionComponent,
    OrgListComponent,
    OrgProfileComponent,
    OrgDetailComponent,
    OrgTypesListComponent,
    OrgAddressesComponent,
    OrgDocumentsComponent,
    OrgNotesComponent,
    AddNewOrgModalComponent,
    OrgSideNavComponent,
    OrgUsersComponent,
    OrgBanksComponent,
    OrgRolesComponent,
    SubOrganizationComponent,
    OrgPortalAccessComponent,
    GenerateUserLoginReportModalComponent,
  ],
  imports: [
    CommonModule,
    FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    UserAccessPoliciesOrgsRoutingModule,
    AdminModule,
    SharedModule,
    AgGridModule,
    AddressesModule,
    ModalModule.forRoot(),
    EffectsModule.forFeature([UserRoleOrgEffects, SubOrgListEffects]),
    BankAccountsModule,
  ],
})
export class UserAccessPoliciesOrgsModule { }
