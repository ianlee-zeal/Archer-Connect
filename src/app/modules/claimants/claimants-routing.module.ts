/* eslint-disable prefer-template */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import * as uuid from 'uuid';

import { PermissionActionTypeEnum, PermissionTypeEnum, ProductCategory, EntityTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { ClaimantsListComponent } from './claimants-list/claimants-list.component';
import { ClaimantDetailsComponent } from './claimant-details/claimant-details.component';
import { CanDeactivateGuard } from '../shared/_guards/can-deactivate.guard';
import { AddressesTabComponent } from './claimant-details/addresses-tab/addresses-tab.component';
import { RepresentativesComponent } from './claimant-details/representatives/representatives.component';
import { GeneralInfoComponent } from './claimant-details/general-info/general-info.component';
import { ContactTabComponent } from './claimant-details/contact-tab/contact-tab.component';
import { UnderConstructionTabComponent } from './claimant-details/under-construction-tab/under-construction-tab.component';
import { CommunicationTabComponent } from './claimant-details/communication-tab/communication-tab.component';
import { InjuryEventsTabComponent } from './claimant-details/injury-events-tab/injury-events-tab.component';
import { ClaimantSideNavComponent } from './claimant-details/claimant-side-nav/claimant-side-nav.component';
import { ClaimantOverviewSectionComponent } from './claimant-details/claimant-sections/claimant-overview-section.component';
import { PermissionGuard } from '../auth/permission-guard';
import { ClaimantOverviewComponent } from './claimant-details/claimant-overview/claimant-overview.component';
import { ClaimantNotesTabComponent } from './claimant-details/claimant-notes-tab/claimant-notes-tab.component';
import { MedicalLiensSectionComponent } from './claimant-details/claimant-sections/medical-liens-section.component';
import { ClaimantIdentifiersComponent } from './claimant-details/identifiers-tab/identifiers-tab.component';

import { ProductDetailsTabComponent } from './product-details/product-details-tab.component';
import { ClaimantProductSectionComponent } from './claimant-details/claimant-sections/claimant-product-section.component';
import { SourceInfoComponent } from './source-info/source-info.component';
import { ClaimantPaymentsComponent } from './claimant-details/claimant-payments/claimant-payments.component';
import { ClaimantPaymentsSectionComponent } from './claimant-details/claimant-sections/claimant-payments-section.component';
import { ClaimantLedgerComponent } from './claimant-details/disbursements/claimant-ledger/claimant-ledger.component';
import { ClaimantDocumentsTabComponent } from './claimant-details/claimant-documents-tab/claimant-documents-tab.component';
import { ElectionFormComponent } from './claimant-details/disbursements/election-form/claimant-ledger/election-form.component';
import { ClaimantPaymentsDetailsComponent } from './claimant-payments-details/claimant-payments-details.component';
import { ClaimantDisbursementsComponent } from './claimant-details/disbursements/claimant-disbursements/claimant-disbursements.component';
import { LedgerSummaryComponent } from './claimant-details/disbursements/ledger-summary/ledger-summary.component';
import { ClaimantElectionFormTabComponent } from './claimant-details/disbursements/election-form/claimant-election-form-tab/claimant-election-form-tab.component';
import { LedgerOverviewComponent } from './claimant-details/disbursements/ledger-overview/ledger-overview.component';
import { ClaimantAccountingDetailsSectionComponent } from './claimant-details/claimant-sections/claimant-accounting-details-section.component';
import { ClaimantInvoiceItemsGridComponent } from './claimant-details/accounting/invoice-items-grid/claimant-invoice-items-grid.component';
import { ProbateContactsTabComponent } from './probate-contacts-tab/probate-contacts-tab.component';
import { ProbateDetailsComponent } from './probate-details/probate-details.component';
import { ProbateChangeHistoryTabComponent } from './claimant-details/probate-change-history-tab/probate-change-history-tab.component';
import { PaymentDetailsComponent } from '../payments/payment-details/payment-details.component';
import { CheckVerificationListComponent } from '../payments/check-verification-list/check-verification-list.component';
import { ClaimantDeficienciesComponent } from './claimant-details/disbursements/deficiencies/claimant-deficiencies.component';
import { ClaimantsDeficienciesSectionComponent } from './claimant-details/claimant-sections/claimant-deficiencies-section.component';
import { PaymentItemDetailListComponent } from '../payments/payment-item-detail-list/payment-item-detail-list.component';
import { ProbateSummaryTabComponent } from './claimant-details/probate-summary/probate-summary-tab.component';
import { BankruptcySummaryTabComponent } from './claimant-details/bankruptcy-summary/bankruptcy-summary-tab.component';
import { ReleaseSummaryTabComponent } from './claimant-details/release-summary/release-summary-tab.component';
import { ClaimantDashboardComponent } from '@app/modules/claimants/claimant-dashboard/claimant-dashboard.component';
import { RedirectComponent } from '@shared/redirect-resolver/redirect-component';
import { redirectResolver } from '@shared/redirect-resolver/redirect-resolvers';
import {
  ClaimantDashboardDeficienciesComponent
} from '@app/modules/claimants/claimant-dashboard/claimant-dashboard-deficiencies/claimant-dashboard-deficiencies.component';

const routes: Routes = [
  {
    path: '',
    component: ClaimantsListComponent,
    canActivate: [PermissionGuard],
    data: {
      permissions: [
        PermissionService.create(PermissionTypeEnum.GlobalClaimantSearch, PermissionActionTypeEnum.Read),
        PermissionService.create(PermissionTypeEnum.Clients, PermissionActionTypeEnum.Read),
      ],
    },
  },
  {
    path: 'saved-search',
    children: [
      {
        path: ':id',
        component: ClaimantsListComponent,
        canActivate: [PermissionGuard],
        data: {
          permissions: [
            PermissionService.create(PermissionTypeEnum.GlobalClaimantSearch, PermissionActionTypeEnum.Read),
            PermissionService.create(PermissionTypeEnum.Clients, PermissionActionTypeEnum.Read),
          ],
        },
      },
    ],
  },
  {
    path: ':id',
    component: ClaimantDetailsComponent,
    canActivate: [PermissionGuard],
    data: {
      componentId: uuid.v4(),
      permissions: [
        PermissionService.create(PermissionTypeEnum.GlobalClaimantSearch, PermissionActionTypeEnum.Read),
        PermissionService.create(PermissionTypeEnum.Clients, PermissionActionTypeEnum.Read),
      ],
    },
    children: [
      {
        path: '',
        component: ClaimantSideNavComponent,
        children: [
          {
            path: '',
            component: RedirectComponent,
            resolve: { redirectPath: redirectResolver },
            data: {
              permissions: [PermissionService.create(PermissionTypeEnum.ClaimantDashboard, PermissionActionTypeEnum.Read)],
              permissionRedirect: 'dashboard', defaultRedirect: 'overview'
            }
          },
          {
            path: 'dashboard',
            component: ClaimantDashboardComponent,
            data: { permissions: [PermissionService.create(PermissionTypeEnum.ClaimantDashboard, PermissionActionTypeEnum.Read)] },
            canActivate: [PermissionGuard],
            children: [
              {
                path: 'deficiencies',
                component: ClaimantDashboardDeficienciesComponent,
                data: { permissions: [PermissionService.create(PermissionTypeEnum.ClaimantDeficiencies, PermissionActionTypeEnum.Read)] },
                canActivate: [PermissionGuard],
              },
            ]
          },
          {
            path: 'overview',
            component: ClaimantOverviewSectionComponent,
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
                      permissions: [PermissionService.create(PermissionTypeEnum.Clients, PermissionActionTypeEnum.ClaimantOverviewTab)],
                      permissionRedirect: 'overview', defaultRedirect: 'details'
                    }
                  },
                  {
                    path: 'overview',
                    component: ClaimantOverviewComponent,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.Clients, PermissionActionTypeEnum.ClaimantOverviewTab)] },
                  },
                  {
                    path: 'details',
                    component: GeneralInfoComponent,
                    canDeactivate: [CanDeactivateGuard],
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.Persons, PermissionActionTypeEnum.Read)] },
                  },
                  {
                    path: 'addresses',
                    component: AddressesTabComponent,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.PersonAddresses, PermissionActionTypeEnum.Read)] },
                  },
                  {
                    path: 'representatives',
                    component: RepresentativesComponent,
                    canActivate: [PermissionGuard],
                    data: { permissions: PermissionService.create(PermissionTypeEnum.ClientOrgAccess, PermissionActionTypeEnum.Read) },
                  },
                  {
                    path: 'contacts',
                    component: ContactTabComponent,
                    canActivate: [PermissionGuard],
                    data: { permissions: PermissionService.create(PermissionTypeEnum.Persons, PermissionActionTypeEnum.Read) },
                  },
                  { path: 'allocations', component: UnderConstructionTabComponent },
                  { path: 'injury-events', component: InjuryEventsTabComponent },
                  {
                    path: 'communications',
                    component: CommunicationTabComponent,
                    canActivate: [PermissionGuard],
                    data: { componentId: uuid.v4(), permissions: [PermissionService.create(PermissionTypeEnum.ClientCommunications, PermissionActionTypeEnum.Read)] },
                  },
                  {
                    path: 'notes',
                    component: ClaimantNotesTabComponent,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.ClientNotes, PermissionActionTypeEnum.Read)] },
                  },
                  {
                    path: 'identifiers',
                    component: ClaimantIdentifiersComponent,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.ClientIdentifiers, PermissionActionTypeEnum.Read)] },
                  },
                  {
                    path: 'documents',
                    component: ClaimantDocumentsTabComponent,
                    canActivate: [PermissionGuard],
                    data: {
                      permissions: [PermissionService.create(PermissionTypeEnum.ClientDocuments, PermissionActionTypeEnum.Read)],
                      entityTypeId: EntityTypeEnum.Clients,
                    },
                  },
                ],
              },
            ],
          },
          {
            path: 'deficiencies',
            component: ClaimantsDeficienciesSectionComponent,
            children: [
              { path: '', pathMatch: 'full', redirectTo: 'tabs' },
              {
                path: 'tabs',
                children: [
                  { path: '', pathMatch: 'full', redirectTo: 'deficiencies-list' },
                  {
                    path: 'deficiencies-list',
                    component: ClaimantDeficienciesComponent,
                  },
                ],
              },
            ],
          },
          {
            path: 'payments',
            component: ClaimantPaymentsSectionComponent,
            canActivate: [PermissionGuard],
            data: { permissions: [PermissionService.create(PermissionTypeEnum.Disbursements, PermissionActionTypeEnum.Read)] },
            children: [
              { path: '', redirectTo: 'tabs', pathMatch: 'full' },
              {
                path: 'tabs',
                children: [
                  { path: '', pathMatch: 'full', redirectTo: 'ledger-summary' },
                  {
                    path: 'history',
                    component: ClaimantPaymentsComponent,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.PaymentHistory, PermissionActionTypeEnum.Read)] },
                  },
                  {
                    path: 'ledger-summary',
                    component: LedgerSummaryComponent,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.ClaimSettlementLedgers, PermissionActionTypeEnum.Read)] },
                  },
                  {
                    path: 'election-form',
                    component: ClaimantElectionFormTabComponent,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.ElectionForms, PermissionActionTypeEnum.Read)] },
                  },
                  {
                    path: 'groups',
                    component: ClaimantDisbursementsComponent,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.ClaimantDisbursementGroups, PermissionActionTypeEnum.Read)] },
                  },
                  {
                    path: 'deficiencies',
                    component: ClaimantDeficienciesComponent,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.ProjectQsfDeficiencies, PermissionActionTypeEnum.Read)]},
                  },
                  {
                    path: 'ledger-overview',
                    component: LedgerOverviewComponent,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.ClaimSettlementLedgers, PermissionActionTypeEnum.Read)] },
                  },
                ],
              },
            ],
          },
          {
            path: 'accounting-details',
            component: ClaimantAccountingDetailsSectionComponent,
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
                    component: ClaimantInvoiceItemsGridComponent,
                    canActivate: [PermissionGuard],
                    data: { permissions: [PermissionService.create(PermissionTypeEnum.AccountingDetails, PermissionActionTypeEnum.Read)] },
                  },
                ],
              },
            ],
          },
          {
            path: 'payments/tabs/ledger-summary/:id',
            component: ClaimantLedgerComponent,
            canDeactivate: [CanDeactivateGuard],
            canActivate: [PermissionGuard],
            data: {
              componentId: uuid.v4(),
              permissions: [PermissionService.create(PermissionTypeEnum.ClaimSettlementLedgers, PermissionActionTypeEnum.Edit)],
            },
          },
          {
            path: 'payments/tabs/history/:id',
            component: ClaimantPaymentsDetailsComponent,
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
            path: 'payments/tabs/election-form/:id',
            component: ElectionFormComponent,
            data: { componentId: uuid.v4() },
          },
          {
            path: 'services',
            children: [
              {
                path: '' + ProductCategory.Release,
                component: ClaimantProductSectionComponent,
                children: [
                  { path: '', redirectTo: 'tabs', pathMatch: 'full' },
                  {
                    path: 'tabs',
                    children: [
                      { path: '', pathMatch: 'full', redirectTo: 'summary' },
                      { path: 'tracking',
                        component: ProductDetailsTabComponent,
                        data: {
                           category: ProductCategory.Release,
                           permissions: [PermissionService.create(PermissionTypeEnum.Release, PermissionActionTypeEnum.ViewTracking)],
                        }
                      },
                      {
                        path: 'sourceinfo',
                        component: SourceInfoComponent,
                        canActivate: [PermissionGuard],
                        data: {
                          category: ProductCategory.Release,
                          permissions: [PermissionService.create(PermissionTypeEnum.Release, PermissionActionTypeEnum.ViewSourceInformation)],
                        },
                      },
                      {
                        path: 'summary',
                        component: ReleaseSummaryTabComponent
                      }
                    ],
                  },
                ],
              },
              {
                path: '' + ProductCategory.MedicalLiens,
                component: MedicalLiensSectionComponent,
              },
              {
                path: '' + ProductCategory.Bankruptcy,
                component: ClaimantProductSectionComponent,
                children: [
                  { path: '', redirectTo: 'tabs', pathMatch: 'full' },
                  {
                    path: 'tabs',
                    children: [
                      { path: '', pathMatch: 'full', redirectTo: 'summary' },
                      {
                        path: 'tracking',
                        component: ProductDetailsTabComponent,
                        data: {
                          category: ProductCategory.Bankruptcy,
                          permissions: [PermissionService.create(PermissionTypeEnum.Bankruptcy, PermissionActionTypeEnum.ViewTracking)],
                        }
                      },
                      {
                        path: 'sourceinfo',
                        canActivate: [PermissionGuard],
                        component: SourceInfoComponent,
                        data: {
                          category: ProductCategory.Bankruptcy,
                          permissions: [PermissionService.create(PermissionTypeEnum.Bankruptcy, PermissionActionTypeEnum.ViewSourceInformation)],
                        },
                      },
                      {
                        path: 'summary',
                        component: BankruptcySummaryTabComponent
                      }
                    ],
                  },
                ],
              },
              {
                path: '' + ProductCategory.Probate,
                component: ClaimantProductSectionComponent,
                children: [
                  { path: '', redirectTo: 'tabs', pathMatch: 'full' },
                  {
                    path: 'tabs',
                    children: [
                      { path: '', pathMatch: 'full', redirectTo: 'summary' },
                      {
                        path: 'details',
                        component: ProbateDetailsComponent,
                        canActivate: [PermissionGuard],
                        data: {
                          category: ProductCategory.Probate,
                          permissions: [PermissionService.create(PermissionTypeEnum.ProbateDetails, PermissionActionTypeEnum.ViewDetails)],
                        },
                      },
                      {
                        path: 'tracking',
                        component: ProductDetailsTabComponent,
                        data: {
                          category: ProductCategory.Probate,
                          permissions: [PermissionService.create(PermissionTypeEnum.ProbateDetails, PermissionActionTypeEnum.ViewTracking)],
                      },
                    },
                      {
                        path: 'sourceinfo',
                        component: SourceInfoComponent,
                        canActivate: [PermissionGuard],
                        data: {
                          category: ProductCategory.Probate,
                          permissions: [PermissionService.create(PermissionTypeEnum.ProbateDetails, PermissionActionTypeEnum.ViewSourceInformation)],
                        },
                      },
                      {
                        path: 'documents',
                        component: ClaimantDocumentsTabComponent,
                        canActivate: [PermissionGuard],
                        data: {
                          category: ProductCategory.Probate,
                          entityTypeId: EntityTypeEnum.Probates,
                          permissions: [PermissionService.create(PermissionTypeEnum.ClientDocuments, PermissionActionTypeEnum.Read)],
                        },
                      },
                      {
                        path: 'contacts',
                        component: ProbateContactsTabComponent,
                        canActivate: [PermissionGuard],
                        data: {
                          category: ProductCategory.Probate,
                          permissions: [PermissionService.create(PermissionTypeEnum.ClientContact, PermissionActionTypeEnum.Read)],
                        },
                      },
                      {
                        path: 'change-history',
                        component: ProbateChangeHistoryTabComponent,
                      },
                      {
                        path: 'summary',
                        component: ProbateSummaryTabComponent
                      }
                    ],
                  },
                ],
              },
            ],
          },
          {
            path: 'overview/tabs/communications',
            loadChildren: () => import('../call-center/call-center.module').then(m => m.CallCenterModule),
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
export class ClaimantsRoutingModule { }
