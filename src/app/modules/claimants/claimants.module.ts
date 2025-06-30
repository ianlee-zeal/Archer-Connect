import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '@app/modules/shared/shared.module';
import { AgGridModule } from 'ag-grid-angular';

import { PaymentsModule } from '@app/modules/payments/payments.module';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { QuillModule } from 'ngx-quill';
import { ClaimantDetailsComponent } from './claimant-details/claimant-details.component';
import { ClaimantsRoutingModule } from './claimants-routing.module';
import { ClaimantsListComponent } from './claimants-list/claimants-list.component';
import { SummaryBarComponent } from './claimant-details/summary-bar/summary-bar.component';
import { AddressesTabComponent } from './claimant-details/addresses-tab/addresses-tab.component';
import { HoldPaymentsModalComponent } from './claimant-details/hold-payments-modal/hold-payments-modal.component';
import { PersonsModule } from '../dashboard/persons/persons.module';
import { RepresentativesComponent } from './claimant-details/representatives/representatives.component';
import { GeneralInfoComponent } from './claimant-details/general-info/general-info.component';
import { ContactTabComponent } from './claimant-details/contact-tab/contact-tab.component';
import { ClaimantIdentifiersComponent } from './claimant-details/identifiers-tab/identifiers-tab.component';
import { UnderConstructionTabComponent } from './claimant-details/under-construction-tab/under-construction-tab.component';
import { CommunicationTabComponent } from './claimant-details/communication-tab/communication-tab.component';
import { ClaimantDashboardComponent } from '@app/modules/claimants/claimant-dashboard/claimant-dashboard.component';
import { ClaimantDashboardReleaseAdminComponent } from './claimant-dashboard/claimant-dashboard-services-summary/claimant-dashboard-release-admin/claimant-dashboard-release-admin.component';
import { ClaimantDashboardBankruptcyComponent } from './claimant-dashboard/claimant-dashboard-services-summary/claimant-dashboard-bankruptcy/claimant-dashboard-bankruptcy.component';
import { ClaimantDashboardProbateComponent } from './claimant-dashboard/claimant-dashboard-services-summary/claimant-dashboard-probate/claimant-dashboard-probate.component';
import { ClaimantDashboardQSFAdminComponent } from './claimant-dashboard/claimant-dashboard-services-summary/claimant-dashboard-qsfadmin/claimant-dashboard-qsfadmin.component';

import { CallCenterModule } from '../call-center/call-center.module';
import { RepresentativeActionsRenderComponent } from './claimant-details/representatives/representative-actions-render/representative-actions-render.component';
import { InjuryEventsTabComponent } from './claimant-details/injury-events-tab/injury-events-tab.component';
import { InjuryEventsListComponent } from './claimant-details/injury-events-tab/injury-events-list/injury-events-list.component';
import { AddNewInjuryEventModalComponent } from './claimant-details/injury-events-tab/add-new-injury-event-modal/add-new-injury-event-modal.component';
import { ClaimantOverviewSectionComponent } from './claimant-details/claimant-sections/claimant-overview-section.component';
import { ClaimantSideNavComponent } from './claimant-details/claimant-side-nav/claimant-side-nav.component';
import { ClaimantOverviewComponent } from './claimant-details/claimant-overview/claimant-overview.component';
import { LienServiceRendererComponent } from './claimant-details/claimant-overview/lien-service-renderer/lien-service-renderer.component';
import { AddressesModule } from '../addresses/addresses.module';
import { LienAdditionalInfoRendererComponent } from './claimant-details/claimant-overview/lien-additional-info-renderer/lien-additional-info-renderer.component';
import { ClaimantNotesTabComponent } from './claimant-details/claimant-notes-tab/claimant-notes-tab.component';
import { MedicalLiensSectionComponent } from './claimant-details/claimant-sections/medical-liens-section.component';
import { MedicalLiensModule } from '../medical-liens/medical-liens.module';
import { ClaimantProductSectionComponent } from './claimant-details/claimant-sections/claimant-product-section.component';
import { ProductDetailsTabComponent } from './product-details/product-details-tab.component';
import { ProductWorkflowModule } from '../product-workflow/product-workflow.module';
import { SourceInfoComponent } from './source-info/source-info.component';
import { SavedSearchesModule } from '../saved-searches/saved-searches.module';
import { ClaimantPaymentsComponent } from './claimant-details/claimant-payments/claimant-payments.component';
import { ClaimantPaymentsSectionComponent } from './claimant-details/claimant-sections/claimant-payments-section.component';
import { ClaimantLedgerComponent } from './claimant-details/disbursements/claimant-ledger/claimant-ledger.component';
import { LedgerAccountGroupComponent } from './claimant-details/disbursements/ledger-group/ledger-account-group.component';
import { ClaimantDocumentsTabComponent } from './claimant-details/claimant-documents-tab/claimant-documents-tab.component';
import { ElectionFormComponent } from './claimant-details/disbursements/election-form/claimant-ledger/election-form.component';
import { ClaimantPaymentsDetailsComponent } from './claimant-payments-details/claimant-payments-details.component';
import { NetAllocationDetailsModalComponent } from './claimant-details/disbursements/net-allocation-details-modal/net-allocation-details-modal.component';
import { NetAllocationDetailsComponent } from './claimant-details/disbursements/net-allocation-details-modal/net-allocation-details/net-allocation-details.component';
import { ClaimantDisbursementsComponent } from './claimant-details/disbursements/claimant-disbursements/claimant-disbursements.component';
import { ClaimantDisbursementGroupList } from './claimant-details/disbursements/claimant-disbursements/claimant-disbursements-list/claimant-disbursements-list.component';
import { DisbursementGroupsModule } from '../disbursement-groups/disbursement-groups.module';
import { ClaimantElectionFormsListComponent } from './claimant-details/disbursements/election-form/claimant-election-forms-list/claimant-election-forms-list.component';
import { ClaimantElectionFormsListActionPanelRendererComponent } from './claimant-details/disbursements/election-form/claimant-election-forms-list/claimant-election-forms-list-action-panel-renderer/claimant-election-forms-list-action-panel-renderer.component';
import { ClaimantElectionFormTabComponent } from './claimant-details/disbursements/election-form/claimant-election-form-tab/claimant-election-form-tab.component';
import { ElectionFormModalComponent } from './claimant-details/disbursements/election-form/election-form-modal/election-form-modal.component';
import { LedgerSummaryComponent } from './claimant-details/disbursements/ledger-summary/ledger-summary.component';
import { EditElectionFormModalComponent } from './claimant-details/disbursements/election-form/edit-election-form-modal/edit-election-form-modal.component';
import { LedgerEntryInfoModalComponent } from './claimant-details/disbursements/additional-info-modal/ledger-entry-info-modal.component';
import { PaymentTrackingListComponent } from './claimant-details/disbursements/additional-info-modal/payment-tracking-list/payment-tracking-list.component';
import { VariancesModalComponent } from './claimant-details/disbursements/variances-modal/variances-modal.component';
import { DeleteLedgerComponent } from './claimant-details/disbursements/delete-ledger-modal/delete-ledger-modal.component';
import { VariancesListComponent } from './claimant-details/disbursements/variances-modal/variances-list/variances-list.component';
import { PaymentInstructionsGridComponent } from './claimant-details/disbursements/additional-info-modal/payment-instructions-grid/payment-instructions-grid.component';
import { PaymentInstructionsGridActionsRendererComponent } from './claimant-details/disbursements/additional-info-modal/payment-instructions-grid/payment-instructions-grid-actions-renderer/payment-instructions-grid-actions-renderer.component';
import { ClosingStatementsSettingsModalComponent } from './claimant-details/disbursements/closing-statements-settings-modal/closing-statements-settings-modal.component';
import { LedgerOverviewComponent } from './claimant-details/disbursements/ledger-overview/ledger-overview.component';
import { HoldPaymentsHistoryGridComponent } from './claimant-details/hold-payments-modal/hold-payments-history-grid/hold-payments-history-grid.component';
import { ClaimantAccountingDetailsSectionComponent } from './claimant-details/claimant-sections/claimant-accounting-details-section.component';
import { ClaimantInvoiceItemsGridComponent } from './claimant-details/accounting/invoice-items-grid/claimant-invoice-items-grid.component';
import { ProbateContactsTabComponent } from './probate-contacts-tab/probate-contacts-tab.component';
import { ProbateDetailsComponent } from './probate-details/probate-details.component';
import { ProbateServiceInformationComponent } from './probate-details/probate-service-information/probate-service-information.component';
import { AdditionalClaimantInformationComponent } from './probate-details/additional-claimant-information/additional-claimant-information.component';
import { ProbatePaymentInformationComponent } from './probate-details/probate-payment-information/probate-payment-information.component';
import { ProbateNotesComponent } from './probate-details/probate-notes/probate-notes.component';
import { ProbatePaymentInformationContactsListComponent } from './probate-details/probate-payment-information/probate-payment-information-contacts-list/probate-payment-information-contacts-list.component';
import { ProbateChangeHistoryTabComponent } from './claimant-details/probate-change-history-tab/probate-change-history-tab.component';
import { FractionPercentagePipe } from '../shared/_pipes/fraction-percentage.pipe';
import { LedgerEntryTypeTitlePipe } from '../shared/_pipes/ledger-entry-type-title.pipe';
import { LedgerAccountTitlePipe } from '../shared/_pipes/ledger/ledger-account-title.pipe';
import { LedgerEtryEntityIdentifierPipe } from '../shared/_pipes/ledger/ledger-entry-entity-identifier.pipe';
import { ClaimantMessagingModalComponent } from './claimant-details/claimant-messaging-modal/claimant-messaging-modal.component';
import { CustomCsFieldsComponent } from './claimant-details/disbursements/custom-cs-fields/custom-cs-fields.component';
import { ReleasePacketTrackingComponent } from './probate-details/release-packet-tracking/release-packet-tracking.component';
import { ClaimantOverviewPaymentsRendererComponent } from './claimant-details/claimant-overview/claimant-overview-product-renderer/claimant-overview-payments/claimant-overview-payments-renderer.component';
import { ClaimantDeficienciesComponent } from './claimant-details/disbursements/deficiencies/claimant-deficiencies.component';
import { ClaimantOverviewQSFAdminComponent } from './claimant-details/claimant-overview/claimant-overview-product-renderer/claimant-overview-qsf-admin/claimant-overview-qsf-admin.component';
import { ClaimantOverviewBankruptcyRendererComponent } from './claimant-details/claimant-overview/claimant-overview-product-renderer/claimant-overview-bankruptcy/claimant-overview-bankruptcy-renderer.component';
import { ClaimantOverviewLiensRendererComponent } from './claimant-details/claimant-overview/claimant-overview-product-renderer/claimant-overview-liens/claimant-overview-liens-renderer.component';
import { ClaimantOverviewProbateRendererComponent } from './claimant-details/claimant-overview/claimant-overview-product-renderer/claimant-overview-probate/claimant-overview-probate-renderer.component';
import { ClaimantOverviewReleaseAdminComponent } from './claimant-details/claimant-overview/claimant-overview-product-renderer/claimant-overview-release/claimant-overview-release-admin.component';
import { ClaimantOverviewInvoicingDetailsComponent } from './claimant-details/claimant-overview/claimant-overview-product-renderer/claimant-overview-invoicing-details/claimant-overview-invoicing-details.component';
import { ClaimantsDeficienciesSectionComponent } from './claimant-details/claimant-sections/claimant-deficiencies-section.component';
import { ProbateSummaryTabComponent } from './claimant-details/probate-summary/probate-summary-tab.component';
import { BankruptcySummaryTabComponent } from './claimant-details/bankruptcy-summary/bankruptcy-summary-tab.component';
import { ReleaseSummaryTabComponent } from './claimant-details/release-summary/release-summary-tab.component';
import { ClaimantStatusComponent } from './claimant-details/claimant-overview/claimant-status/claimant-status.component';
import { GenerateFinalStatusLetterModalComponent } from './claimant-details/claimant-sections/generate-final-status-letter-modal/generate-final-status-letter-modal.component';
import { ClaimantDashboardPaymentsGridComponent } from './claimant-dashboard/claimant-dashboard-payments/claimant-dashboard-payments-grid.component';
import { ClaimantDashboardLienResolutionComponent } from '@app/modules/claimants/claimant-dashboard/claimant-dashboard-services-summary/claimant-dashboard-lien-resolution/claimant-dashboard-lien-resolution.component';
import { ResolveDeficienciesModalComponent } from './claimant-dashboard/claimant-dashboard-deficiencies/resolve-deficiency-modal/resolve-deficiency-modal.component';
import { DeficiencySummaryCardComponent } from './claimant-dashboard/claimant-dashboard-deficiencies/resolve-deficiency-modal/deficiency-summary-card/deficiency-summary-card.component';
import { ClaimantDashboardDeficienciesComponent } from './claimant-dashboard/claimant-dashboard-deficiencies/claimant-dashboard-deficiencies.component';
import { ClaimantDashboardUncuredDeficienciesCountComponent } from '@app/modules/claimants/claimant-dashboard/claimant-dashboard-services-summary/claimant-dashboard-uncured-deficiencies-count/claimant-dashboard-uncured-deficiencies-count.component';
import {
  DeficiencyDateExpectedResponseComponent
} from './claimant-dashboard/claimant-dashboard-deficiencies/resolve-deficiency-modal/deficiency-date-expected-response/deficiency-date-expected-response.component';

@NgModule({
  declarations: [
    BankruptcySummaryTabComponent,
    ClaimantsListComponent,
    ClaimantDetailsComponent,
    SummaryBarComponent,
    GeneralInfoComponent,
    AddressesTabComponent,
    ClaimantInvoiceItemsGridComponent,
    ClaimantAccountingDetailsSectionComponent,
    HoldPaymentsModalComponent,
    RepresentativesComponent,
    ContactTabComponent,
    InjuryEventsTabComponent,
    InjuryEventsListComponent,
    ClaimantIdentifiersComponent,
    AddNewInjuryEventModalComponent,
    UnderConstructionTabComponent,
    CommunicationTabComponent,
    ClaimantNotesTabComponent,
    ClaimantSideNavComponent,
    RepresentativeActionsRenderComponent,
    ClaimantOverviewSectionComponent,
    ClaimantProductSectionComponent,
    ProductDetailsTabComponent,
    MedicalLiensSectionComponent,
    ClaimantOverviewComponent,
    ClaimantOverviewLiensRendererComponent,
    ClaimantOverviewProbateRendererComponent,
    ClaimantOverviewBankruptcyRendererComponent,
    ClaimantOverviewPaymentsRendererComponent,
    ClaimantOverviewQSFAdminComponent,
    ClaimantOverviewReleaseAdminComponent,
    ClaimantOverviewInvoicingDetailsComponent,
    LienServiceRendererComponent,
    LienAdditionalInfoRendererComponent,
    SourceInfoComponent,
    ClaimantPaymentsComponent,
    ClaimantPaymentsSectionComponent,
    ClaimantLedgerComponent,
    LedgerAccountGroupComponent,
    ClaimantDocumentsTabComponent,
    ElectionFormComponent,
    ClaimantPaymentsDetailsComponent,
    NetAllocationDetailsModalComponent,
    VariancesModalComponent,
    DeleteLedgerComponent,
    VariancesListComponent,
    NetAllocationDetailsComponent,
    ClaimantDisbursementsComponent,
    ClaimantDisbursementGroupList,
    ClaimantElectionFormsListComponent,
    ClaimantElectionFormsListActionPanelRendererComponent,
    ClaimantElectionFormTabComponent,
    ElectionFormModalComponent,
    LedgerSummaryComponent,
    ClaimantDeficienciesComponent,
    LedgerOverviewComponent,
    EditElectionFormModalComponent,
    LedgerEntryInfoModalComponent,
    PaymentTrackingListComponent,
    ClosingStatementsSettingsModalComponent,
    CustomCsFieldsComponent,
    PaymentInstructionsGridComponent,
    PaymentInstructionsGridActionsRendererComponent,
    HoldPaymentsHistoryGridComponent,
    ProbateContactsTabComponent,
    ProbateDetailsComponent,
    ProbateSummaryTabComponent,
    ProbateServiceInformationComponent,
    AdditionalClaimantInformationComponent,
    ProbatePaymentInformationComponent,
    ProbateNotesComponent,
    ProbatePaymentInformationContactsListComponent,
    ProbateChangeHistoryTabComponent,
    FractionPercentagePipe,
    LedgerEntryTypeTitlePipe,
    LedgerAccountTitlePipe,
    LedgerEtryEntityIdentifierPipe,
    ClaimantMessagingModalComponent,
    ReleasePacketTrackingComponent,
    ReleaseSummaryTabComponent,
    ClaimantsDeficienciesSectionComponent,
    ClaimantStatusComponent,
    GenerateFinalStatusLetterModalComponent,
    ClaimantDashboardComponent,
    ClaimantDashboardReleaseAdminComponent,
    ClaimantDashboardUncuredDeficienciesCountComponent,
    ClaimantDashboardPaymentsGridComponent,
    ClaimantDashboardBankruptcyComponent,
    ClaimantDashboardLienResolutionComponent,
    ClaimantDashboardProbateComponent,
    ClaimantDashboardQSFAdminComponent,
    ResolveDeficienciesModalComponent,
    DeficiencySummaryCardComponent,
    ClaimantDashboardDeficienciesComponent,
    DeficiencyDateExpectedResponseComponent
  ],
  providers: [provideNgxMask()],
  imports: [
    CommonModule,
    ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    ClaimantsRoutingModule,
    SharedModule,
    PersonsModule,
    CallCenterModule,
    AddressesModule,
    PaymentsModule,
    MedicalLiensModule,
    SavedSearchesModule,
    ProductWorkflowModule,
    DisbursementGroupsModule,
    QuillModule,
    AgGridModule,
    NgxMaskDirective, NgxMaskPipe,
  ],
})
export class ClaimantsModule { }
