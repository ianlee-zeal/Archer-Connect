import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import * as uuid from 'uuid';

import { ProjectListComponent } from '@shared/project-list/project-list.component';
import { PermissionActionTypeEnum, PermissionTypeEnum, ProductCategory } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { ProjectOverviewSectionComponent } from './sections/project-overview-section.component';
import { TabPlaceholderUnderConstructionComponent } from '../shared/tab-placeholder/tab-placeholder-under-construction/tab-placeholder-under-construction.component';
import { ProjectServicesSectionComponent } from './sections/project-services-section.component';
import { ProjectSideNavComponent } from './project-side-nav/project-side-nav.component';
import { ProjectClaimantsOverviewTabComponent } from './tabs/project-claimants-overview-tab/project-claimants-overview-tab.component';
import { PermissionGuard } from '../auth/permission-guard';
import { ProjectImportsComponent } from './tabs/project-imports/project-imports.component';
import { ProjectDetailsComponent } from './project-details/project-details.component';
import { ProjectClaimantListSectionComponent } from './sections/project-claimant-list-section.component';
import { ProbateSectionComponent } from './sections/probate-section.component';
import { ProjectOverviewTabComponent } from './tabs/project-overview-tab/project-overview-tab.component';
import { ProjectDetailsTabComponent } from './tabs/project-details-tab/project-details-tab.component';
import { ReleaseSectionComponent } from './sections/release-section.component';
import { BankruptcySectionComponent } from './sections/bankruptcy-section.component';
import { LienResolutionSectionComponent } from './sections/lien-resolution-section.component';
import { ProjectPaymentsSectionComponent } from './sections/project-payments-section.component';
import { ProjectPaymentsComponent } from './project-payments/project-payments.component';
import { ProjectLedgerSettings } from './project-ledger-settings/project-ledger-settings.component';
import { ProjectDisbursementElectionFormsComponent } from './project-disbursement-election-forms/project-disbursement-election-forms.component';
import { ProjectPaymentsDetailsComponent } from './project-payments-details/project-payments-details.component';
import { ProjectDisbursementGroupsComponent } from './project-disbursement-groups/project-disbursement-groups.component';
import { ProjectDisbursementClaimantSummaryComponent } from './project-disbursement-claimant-summary/project-disbursement-claimant-summary.component';
import { ProjectDocumentsTabComponent } from './tabs/project-documents-tab/project-documents-tab.component';
import { ProjectDisbursementNotesComponent } from './project-disbursement-notes/project-disbursement-notes.component';
import { ProjectChartOfAccountsComponent } from './project-chart-of-accounts/project-chart-of-accounts.component';
import { ProjectSettingsSectionComponent } from './sections/project-settings-section.component';
import { ProjectScopeOfWorkComponent } from './project-scope-of-work/project-scope-of-work.component';
import { ProjectReceivablesComponent } from './project-receivables/project-receivables.component';
import { BillingRules } from './billing-rule/billing-rules.component';
import { BillingRulesListComponent } from './billing-rule/billing-rules-list/billing-rules-list.component';
import { BillingRuleCreationComponent } from './billing-rule/billing-rule-creation/billing-rule-creation.component';
import { BillingRuleDetailsComponent } from './billing-rule/billing-rule-details/billing-rule-details.component';
import { ProjectOrganizationsSectionComponent } from './sections/project-organizations-section.component';
import { ProjectDeficienciesSectionComponent } from './sections/project-deficiencies-section.component';
import { ProjectPortalDeficienciesSectionComponent } from './sections/project-portal-deficiencies-section.component';
import { ProjectOrganizationListComponent } from './project-organization-list/project-organization-list.component';
import { ProjectContactsSectionComponent } from './sections/project-contacts-section.component';
import { ProjectContactsTabComponent } from './tabs/project-contacts-tab/project-contacts-tab.component';
import { AccountingDetailsSectionComponent } from './sections/accounting-details-section.component';
import { InvoiceItemsGridComponent } from './accounting/invoice-items-grid/invoice-items-grid.component';
import { ProjectNotesComponent } from './tabs/project-notes/project-notes.component';
import { ProjectDisbursementPaymentQueueComponent } from './project-disbursement-payment-queue/project-disbursement-payment-queue.component';
import { ProjectDeficienciesListComponent } from './project-deficiencies-list/project-deficiencies-list.component';
import { ProjectPortalDeficienciesListComponent } from './project-portal-deficiencies-list/project-portal-deficiencies-list.component';
import { ProjectDisbursementPaymentRequestsComponent } from './project-disbursement-payment-requests/project-disbursement-payment-requests.component';
import { ProjectDisbursementClosingStatementComponent } from './project-disbursement-closing-statement/project-disbursement-closing-statement.component';
import { ProjectCommunicationsTabComponent } from './tabs/project-communications-tab/project-communications-tab.component';
import { ClaimantSummaryRollupComponent } from './project-disbursement-claimant-summary-rollup/claimant-summary-rollup.component';
import { ProjectMessagingComponent } from './project-messaging/project-messaging.component';
import { PaymentDetailsComponent } from '../payments/payment-details/payment-details.component';
import { CheckVerificationListComponent } from '../payments/check-verification-list/check-verification-list.component';
import { PermissionGuardSome } from '../auth/permission-guard-some';
import { PaymentItemDetailListComponent } from '../payments/payment-item-detail-list/payment-item-detail-list.component';
import { ProjectOrgPaymentStatusComponent } from './project-org-payment-status/project-org-payment-status.component';
import { QsfAdminDashboardComponent } from '../liens-dashboards/qsf-admin-dashboard/qsf-admin-dashboard.component';
import { ProjectReporting } from './project-reporting/project-reporting.component';
import { ProjectReportingListComponent } from './project-reporting/project-reporting-list/project-reporting-list.component';
import { ProjectReportingDetailsComponent } from './project-reporting/project-reporting-details/project-reporting-details.component';
import { ProjectDeficienciesRecentReportsComponent } from './project-deficiencies-recent-reports/project-deficiencies-recent-reports.component';
import { ClaimsSectionComponent } from './sections/claims-section.component';
import { RedirectComponent } from '../shared/redirect-resolver/redirect-component';
import { redirectResolver } from '../shared/redirect-resolver/redirect-resolvers';
import { ProjectDashboardComponent } from './project-dashboard/project-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: ProjectListComponent,
    canActivate: [PermissionGuard],
    data: {
      permissions: [
        PermissionService.create(PermissionTypeEnum.GlobalProjectSearch, PermissionActionTypeEnum.Read),
        PermissionService.create(PermissionTypeEnum.Projects, PermissionActionTypeEnum.Read),
      ],
    },
  },
  {
    path: ':id',
    component: ProjectDetailsComponent,
    canActivate: [PermissionGuard],
    data: {
      componentId: uuid.v4(),
      permissions: [
        PermissionService.create(PermissionTypeEnum.GlobalProjectSearch, PermissionActionTypeEnum.Read),
        PermissionService.create(PermissionTypeEnum.Projects, PermissionActionTypeEnum.Read),
      ],
    },
    children: [
      {
        path: '',
        component: ProjectSideNavComponent,
        children: [
          {
            path: '',
            component: RedirectComponent,
            resolve: { redirectPath: redirectResolver },
            data: {
              permissions: [PermissionService.create(PermissionTypeEnum.ProjectDashboard, PermissionActionTypeEnum.Read)],
              permissionRedirect: 'dashboard', defaultRedirect: 'overview'
            }
          },
          {
            path: 'dashboard',
            component: ProjectDashboardComponent,
            data: { permissions: [PermissionService.create(PermissionTypeEnum.ProjectDashboard, PermissionActionTypeEnum.Read)] },
            canActivate: [PermissionGuard]
          },
          {
            path: 'overview',
            component: ProjectOverviewSectionComponent,
            children: [
              { path: '', pathMatch: 'full', redirectTo: 'tabs' },
              {
                path: 'tabs',
                children: [
                  {
                    path: '',
                    component: RedirectComponent,
                    resolve: { redirectPath: redirectResolver },
                    data: {
                      permissions: [PermissionService.create(PermissionTypeEnum.Projects, PermissionActionTypeEnum.ProjectOverviewTab)],
                      permissionRedirect: 'overview', defaultRedirect: 'details'
                    }
                  },
                  { path: 'overview',
                    component: ProjectOverviewTabComponent,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.Projects, PermissionActionTypeEnum.ProjectOverviewTab)] },
                  },
                  { path: 'details', component: ProjectDetailsTabComponent },
                  {
                    path: 'imports',
                    component: ProjectImportsComponent,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.ProjectImports, PermissionActionTypeEnum.Read)] },
                  },
                  {
                    path: 'notes',
                    component: ProjectNotesComponent,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.ProjectNotes, PermissionActionTypeEnum.Read)] },
                  },
                  {
                    path: 'documents',
                    component: ProjectDocumentsTabComponent,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.ProjectsDocuments, PermissionActionTypeEnum.Read)] },
                  },
                  {
                    path: 'communications',
                    component: ProjectCommunicationsTabComponent,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.ProjectsCommunications, PermissionActionTypeEnum.Read)] },
                  },
                ],
              },
            ],
          },
          {
            path: 'overview/tabs/communications',
            loadChildren: () => import('../call-center/call-center.module').then(m => m.CallCenterModule),
          },
          {
            path: 'deficiencies',
            component: ProjectDeficienciesSectionComponent,
            children: [
              { path: '', pathMatch: 'full', redirectTo: 'tabs' },
              {
                path: 'tabs',
                children: [
                  { path: '', pathMatch: 'full', redirectTo: 'deficiencies-list' },
                  {
                    path: 'deficiencies-list',
                    component: ProjectDeficienciesListComponent,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.ProjectQsfDeficiencies, PermissionActionTypeEnum.Read)] },
                  },
                ],
              },
            ],
          },
          {
            path: 'portal-deficiencies',
            component: ProjectPortalDeficienciesSectionComponent,
            children: [
              { path: '', pathMatch: 'full', redirectTo: 'tabs' },
              {
                path: 'tabs',
                children: [
                  { path: '', pathMatch: 'full', redirectTo: 'deficiencies-list' },
                  {
                    path: 'deficiencies-list',
                    component: ProjectPortalDeficienciesListComponent,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.ProjectDeficiencies, PermissionActionTypeEnum.Read)] },
                  },
                  {
                    path: 'recent-reports',
                    component: ProjectDeficienciesRecentReportsComponent,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.ProjectDeficiencies, PermissionActionTypeEnum.Read)] },
                  },
                ],
              },
            ],
          },
          {
            path: 'payments',
            component: ProjectPaymentsSectionComponent,
            canActivate: [PermissionGuard],
            data: { permissions: [PermissionService.create(PermissionTypeEnum.Disbursements, PermissionActionTypeEnum.Read)] },
            children: [
              { path: '', redirectTo: 'tabs', pathMatch: 'full' },
              {
                path: 'tabs',
                children: [
                  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
                  {
                    path: 'history',
                    component: ProjectPaymentsComponent,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.PaymentHistory, PermissionActionTypeEnum.Read)] },
                  },
                  {
                    path: 'election-forms',
                    component: ProjectDisbursementElectionFormsComponent,
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.ElectionForms, PermissionActionTypeEnum.Read)] },
                  },
                  {
                    path: 'payment-requests',
                    component: ProjectDisbursementPaymentRequestsComponent,
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.ManualPaymentRequest, PermissionActionTypeEnum.Read)] },
                  },
                  {
                    path: 'dashboard',
                    component: QsfAdminDashboardComponent,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.Disbursements, PermissionActionTypeEnum.Read)] },
                  },
                  {
                    path: 'groups',
                    component: ProjectDisbursementGroupsComponent,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.DisbursementGroups, PermissionActionTypeEnum.Read)] },
                  },
                  {
                    path: 'claimant-summary',
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.ClaimantSummary, PermissionActionTypeEnum.Read)] },
                    children: [
                      { path: '', component: ProjectDisbursementClaimantSummaryComponent },
                      {
                        path: 'saved-search',
                        children: [
                          {
                            path: ':id',
                            component: ProjectDisbursementClaimantSummaryComponent,
                            canActivate: [PermissionGuard],
                            data: {
                              permissions: [
                                PermissionService.create(PermissionTypeEnum.ClaimantSummary, PermissionActionTypeEnum.Read),
                              ],
                              clearGridFilters: true,
                            },
                          },
                        ],
                      },
                    ],
                  },
                  {
                    path: 'claimant-summary-rollup',
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.ClaimantSummary, PermissionActionTypeEnum.Read)] },
                    children: [
                      { path: '', component: ClaimantSummaryRollupComponent },
                      {
                        path: 'saved-search',
                        children: [
                          {
                            path: ':id',
                            component: ClaimantSummaryRollupComponent,
                            canActivate: [PermissionGuard],
                            data: {
                              permissions: [
                                PermissionService.create(PermissionTypeEnum.ClaimantSummary, PermissionActionTypeEnum.Read),
                              ],
                              clearGridFilters: true,
                            },
                          },
                        ],
                      },
                    ],
                  },
                  { path: 'qsf-sweep', loadChildren: () => import('../qsf-sweep/qsf-sweep.module').then(m => m.QsfSweepModule) },
                  {
                    path: 'payment-queue',
                    children: [
                      { path: '', component: ProjectDisbursementPaymentQueueComponent },
                      {
                        path: 'saved-search',
                        children: [
                          {
                            path: ':id',
                            component: ProjectDisbursementPaymentQueueComponent,
                            canActivate: [PermissionGuard],
                            data: {
                              permissions: [
                                PermissionService.create(PermissionTypeEnum.PaymentQueues, PermissionActionTypeEnum.Read),
                              ],
                              clearGridFilters: true,
                            },
                          },
                        ],
                      },
                    ],
                  },
                  {
                    path: 'notes',
                    component: ProjectDisbursementNotesComponent,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.ProjectDisbursementNotes, PermissionActionTypeEnum.Read)] },
                  },
                  {
                    path: 'closing-statements',
                    component: ProjectDisbursementClosingStatementComponent,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.ProjectsClosingStatement, PermissionActionTypeEnum.Read)] },
                  },
                  {
                    path: 'org-payment-status',
                    component: ProjectOrgPaymentStatusComponent,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.ProjectOrgPaymentStatus, PermissionActionTypeEnum.Read)] },
                  }
                ],
              },
            ],
          },
          {
            path: 'accounting-details',
            component: AccountingDetailsSectionComponent,
            canActivate: [PermissionGuard],
            data: { permissions: [PermissionService.create(PermissionTypeEnum.AccountingDetails, PermissionActionTypeEnum.Read)] },
            children: [
              { path: '', redirectTo: 'tabs', pathMatch: 'full' },
              {
                path: 'tabs',
                children: [
                  { path: '', pathMatch: 'full', redirectTo: 'invoice-items' },
                  {
                    path: 'invoice-items',
                    component: InvoiceItemsGridComponent,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.AccountingDetails, PermissionActionTypeEnum.Read)] },
                  },
                ],
              },
            ],
          },
          {
            path: 'payments/tabs/history/:id',
            component: ProjectPaymentsDetailsComponent,
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
            path: 'claimants',
            component: ProjectClaimantListSectionComponent,
            canActivate: [PermissionGuard],
            data: { permissions: [PermissionService.create(PermissionTypeEnum.Clients, PermissionActionTypeEnum.Read)] },
            children: [
              { path: '', pathMatch: 'full', redirectTo: 'tabs' },
              {
                path: 'tabs',
                children: [
                  { path: '', pathMatch: 'full', redirectTo: 'overview' },
                  {
                    path: 'overview',
                    children: [
                      { path: '', component: ProjectClaimantsOverviewTabComponent },
                      {
                        path: 'saved-search',
                        children: [
                          {
                            path: ':id',
                            component: ProjectClaimantsOverviewTabComponent,
                            canActivate: [PermissionGuard],
                            data: {
                              permissions: [
                                PermissionService.create(PermissionTypeEnum.GlobalClaimantSearch, PermissionActionTypeEnum.Read),
                                PermissionService.create(PermissionTypeEnum.Clients, PermissionActionTypeEnum.Read),
                              ],
                              clearGridFilters: true,
                            },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            path: 'organizations',
            component: ProjectOrganizationsSectionComponent,
            children: [
              { path: '', pathMatch: 'full', redirectTo: 'tabs' },
              {
                path: 'tabs',
                children: [
                  { path: '', pathMatch: 'full', redirectTo: 'organizations-list' },
                  {
                    path: 'organizations-list',
                    component: ProjectOrganizationListComponent,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.Organizations, PermissionActionTypeEnum.Read)] },
                  },
                ],
              },
            ],

          },
          {
            path: 'settings',
            component: ProjectSettingsSectionComponent,
            children: [
              { path: '', pathMatch: 'full', redirectTo: 'tabs' },
              {
                path: 'tabs',
                children: [
                  { path: '', pathMatch: 'full', redirectTo: 'scope-of-work' },
                  {
                    path: 'scope-of-work',
                    component: ProjectScopeOfWorkComponent,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.ProjectSettings, PermissionActionTypeEnum.Read)] },
                  },
                  {
                    path: 'receivables',
                    component: ProjectReceivablesComponent,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.ProjectSettings, PermissionActionTypeEnum.Read)] },
                  },
                  {
                    path: 'contract-rules',
                    component: BillingRules,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.BillingRule, PermissionActionTypeEnum.Read)] },
                    children: [
                      {
                        path: '',
                        component: BillingRulesListComponent,
                      },
                      {
                        path: 'new',
                        component: BillingRuleCreationComponent,
                        canActivate: [PermissionGuard],
                        data: { permissions: [PermissionService.create(PermissionTypeEnum.BillingRule, PermissionActionTypeEnum.Create)] },
                      },
                      {
                        path: ':id',
                        component: BillingRuleDetailsComponent,
                        canActivate: [PermissionGuard],
                        data: { permissions: [PermissionService.create(PermissionTypeEnum.BillingRule, PermissionActionTypeEnum.Read)] },
                      },
                    ],
                  },
                  {
                    path: 'settings',
                    component: ProjectLedgerSettings,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.LedgerSettings, PermissionActionTypeEnum.Read)] },
                  },
                  {
                    path: 'accounts',
                    component: ProjectChartOfAccountsComponent,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.ChartOfAccounts, PermissionActionTypeEnum.Read)] },
                  },
                  {
                    path: 'messaging',
                    component: ProjectMessagingComponent,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.ProjectMessaging, PermissionActionTypeEnum.Read)] },
                  },
                  {
                    path: 'deficiencies',
                    loadChildren: () => import('./project-deficiencies-setting/project-deficiencies-setting.module').then(m => m.ProjectDeficienciesSettingModule),
                    canActivate: [PermissionGuardSome],
                    data: { permissions: [
                      PermissionService.create(PermissionTypeEnum.ProjectQsfDeficiencies, PermissionActionTypeEnum.ManageDeficienciesSettingsTemplates),
                      PermissionService.create(PermissionTypeEnum.ProjectQsfDeficiencies, PermissionActionTypeEnum.Read),
                    ] },
                  },
                  {
                    path: 'reporting',
                    component: ProjectReporting,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.ReportSettings, PermissionActionTypeEnum.Read)] },
                    children: [
                      {
                        path: '',
                        component: ProjectReportingListComponent,
                      },
                      {
                        path: ':id',
                        component: ProjectReportingDetailsComponent,
                        canActivate: [PermissionGuard],
                        data: { permissions: [PermissionService.create(PermissionTypeEnum.ReportSettings, PermissionActionTypeEnum.Read)] },
                      }
                    ]
                  }
                ],
              },
            ],
          },
          {
            path: 'contacts',
            component: ProjectContactsSectionComponent,
            children: [
              { path: '', pathMatch: 'full', redirectTo: 'tabs' },
              {
                path: 'tabs',
                children: [
                  { path: '', pathMatch: 'full', redirectTo: 'info' },
                  {
                    path: 'info',
                    component: ProjectContactsTabComponent,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.ProjectContacts, PermissionActionTypeEnum.Read)] },
                  },
                ],
              },
            ],
          },
          {
            path: `services/${ProductCategory.MedicalLiens}`,
            component: LienResolutionSectionComponent,
            canActivate: [PermissionGuard],
            data: { permissions: [PermissionService.create(PermissionTypeEnum.LienProducts, PermissionActionTypeEnum.Read)] },
          },
          {
            path: `services/${ProductCategory.Probate}`,
            component: ProbateSectionComponent,
            canActivate: [PermissionGuard],
            data: { permissions: [PermissionService.create(PermissionTypeEnum.ProbateDashboards, PermissionActionTypeEnum.Read)] },
          },
          {
            path: `services/${ProductCategory.Release}`,
            component: ReleaseSectionComponent,
            canActivate: [PermissionGuard],
            data: { permissions: [PermissionService.create(PermissionTypeEnum.Release, PermissionActionTypeEnum.Read)] },
          },
          {
            path: `services/${ProductCategory.Bankruptcy}`,
            component: BankruptcySectionComponent,
            canActivate: [PermissionGuard],
            data: { permissions: [PermissionService.create(PermissionTypeEnum.Bankruptcy, PermissionActionTypeEnum.Read)] },
          },
          {
            path: `services/${ProductCategory.ClaimsAdministration}`,
            component: ClaimsSectionComponent,
            canActivate: [PermissionGuard],
            data: { permissions: [PermissionService.create(PermissionTypeEnum.Claims, PermissionActionTypeEnum.Read)] },
          },
          {
            path: 'services',
            children: [
              {
                path: ':id',
                component: ProjectServicesSectionComponent,
                children: [
                  { path: '', redirectTo: 'tabs', pathMatch: 'full' },
                  {
                    path: 'tabs',
                    children: [
                      { path: '', pathMatch: 'full', redirectTo: 'overview' },
                      { path: 'overview', component: TabPlaceholderUnderConstructionComponent },
                    ],
                  },
                ],
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
export class ProjectsRoutingModule { }
