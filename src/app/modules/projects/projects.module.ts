import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';

// Import FusionCharts library
import { PaymentQueueEffects } from '@app/modules/payment-queue/state/effects';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { FusionChartsModule } from 'angular-fusioncharts';
import * as FusionCharts from 'fusioncharts';
import * as Charts from 'fusioncharts/fusioncharts.charts';
import * as FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { QuillModule } from 'ngx-quill';
import { ProjectClaimantsOverviewTabComponent } from './tabs/project-claimants-overview-tab/project-claimants-overview-tab.component';

import { DisbursementGroupsModule } from '../disbursement-groups/disbursement-groups.module';
import { DisbursementsModule } from '../disbursements/disbursements.module';
import { LiensModule } from '../liens-dashboards/liens.module';
import { PaymentsModule } from '../payments/payments.module';
import { OutcomeBasedPricingModalComponent } from '../shared/outcome-based-pricing-list/outcome-based-pricing-modal/outcome-based-pricing-modal.component';
import { SharedModule } from '../shared/shared.module';
import { BillingRuleCreationComponent } from './billing-rule/billing-rule-creation/billing-rule-creation.component';
import { BillingRuleDetailsComponent } from './billing-rule/billing-rule-details/billing-rule-details.component';
import { BillingRuleFormComponent } from './billing-rule/billing-rule-form/billing-rule-form.component';
import { BillingRulesListComponent } from './billing-rule/billing-rules-list/billing-rules-list.component';
import { BillingRules } from './billing-rule/billing-rules.component';
import { FeeCapsListComponent } from './billing-rule/fee-caps-list/fee-caps-list.component';
import { FeeSplitListComponent } from './billing-rule/fee-split-list/fee-split-list.component';
import { FeeSplitComponent } from './billing-rule/fee-split-list/fee-split/fee-split.component';
import { OutcomeBasedPricingViewComponent } from './billing-rule/outcome-based-pricing-view/outcome-based-pricing-view.component';
import { BrServicesCellRendererComponent } from './billing-rule/renderers/services-cell-renderer/services-cell-renderer.component';
import { BillingRuleEffects } from './billing-rule/state/effects';
import { CreateProjectModalComponent } from './create-project-modal/create-project-modal.component';
import { ProjectActionPanelCellRendererComponent } from './project-action-panel-cell-renderer/project-action-panel-cell-renderer.component';
import { ProjectChartOfAccountsComponent } from './project-chart-of-accounts/project-chart-of-accounts.component';
import { ProjectDeficienciesRecentReportsComponent } from './project-deficiencies-recent-reports/project-deficiencies-recent-reports.component';
import { ProjectDetailsComponent } from './project-details/project-details.component';
import { ClaimantSummaryListComponent } from './project-disbursement-claimant-summary/claimant-summary-list/claimant-summary-list.component';
import { GeneratePaymentRequestModalComponent } from './project-disbursement-claimant-summary/modals/generate-payment-request-modal/generate-payment-request-modal.component';
import { ProjectDisbursementClaimantSummaryComponent } from './project-disbursement-claimant-summary/project-disbursement-claimant-summary.component';
import { ClaimantSummaryButtonsRendererComponent } from './project-disbursement-claimant-summary/renderers/claimant-summary-renderer/claimant-summary-buttons-renderer';
import { StatusRendererComponent } from './project-disbursement-claimant-summary/renderers/status-renderer/status-renderer.component';
import { ClaimantsSummaryEffects } from './project-disbursement-claimant-summary/state/effects';
import { ElectionFormsListComponent } from './project-disbursement-election-forms/election-forms-list/election-forms-list.component';
import { ProjectDisbursementElectionFormsComponent } from './project-disbursement-election-forms/project-disbursement-election-forms.component';
import { ElectionFormsRendererComponent } from './project-disbursement-election-forms/renderers/election-forms-buttons-renderer';
import { ElectionFormsEffects } from './project-disbursement-election-forms/state/effects';
import { ProjectDisbursementGroupList } from './project-disbursement-group-list/project-disbursement-group-list.component';
import { CreateDisbursementGroupModalComponent } from './project-disbursement-groups/create-disbursement-group-modal/create-disbursement-group-modal.component';
import { EditDisbursementGroupModalComponent } from './project-disbursement-groups/edit-disbursement-group-modal/edit-disbursement-group-modal.component';
import { ProjectDisbursementGroupsComponent } from './project-disbursement-groups/project-disbursement-groups.component';
import { ProjectDisbursementNotesComponent } from './project-disbursement-notes/project-disbursement-notes.component';
import { ClosingStatementSettingsComponent } from './project-ledger-settings/closing-statement-settings/closing-statement-settings.component';
import { CommonSettingsComponent } from './project-ledger-settings/common-settings/common-settings.component';
import { DeliverySettingsComponent } from './project-ledger-settings/delivery-settings/delivery-settings.component';
import { DigitalPaymentSettingsComponent } from './project-ledger-settings/digital-payment-settings/digital-payment-settings.component';
import { FormulaSettingsComponent } from './project-ledger-settings/formula-settings/formula-settings.component';
import { ProjectLedgerSettings } from './project-ledger-settings/project-ledger-settings.component';
import { LedgeSettingsEffects } from './project-ledger-settings/state/effects';
import { ProjectPaymentsDetailsComponent } from './project-payments-details/project-payments-details.component';
import { ProjectPaymentsComponent } from './project-payments/project-payments.component';
import { EngagementConditionsComponent } from './project-scope-of-work/engagement-conditions/engagement-conditions.component';
import { EngagementProductsComponent } from './project-scope-of-work/engagement-products/engagement-products.component';
import { ProductCategoryStatusComponent } from './project-scope-of-work/product-category-status/product-category-status.component';
import { ProjectScopeOfWorkComponent } from './project-scope-of-work/project-scope-of-work.component';
import { ScopeOfWorkEffects } from './project-scope-of-work/state/effects';
import { ProjectSideNavComponent } from './project-side-nav/project-side-nav.component';
import { ProjectsRoutingModule } from './projects-routing.module';
import { BankruptcySectionComponent } from './sections/bankruptcy-section.component';
import { ClaimsSectionComponent } from './sections/claims-section.component';
import { LienResolutionSectionComponent } from './sections/lien-resolution-section.component';
import { ProbateSectionComponent } from './sections/probate-section.component';
import { ProjectClaimantListSectionComponent } from './sections/project-claimant-list-section.component';
import { ProjectOverviewSectionComponent } from './sections/project-overview-section.component';
import { ProjectPaymentsSectionComponent } from './sections/project-payments-section.component';
import { ProjectServicesSectionComponent } from './sections/project-services-section.component';
import { ProjectSettingsSectionComponent } from './sections/project-settings-section.component';
import { ReleaseSectionComponent } from './sections/release-section.component';
import { ProjectsEffects } from './state/effects';
import { ProjectsReducer } from './state/reducer';
import { GeneralInfoTabComponent } from './tabs/general-info-tab/general-info-tab.component';
import { AddContactModalComponent } from './tabs/project-contacts-tab/add-contact-modal/add-contact-modal.component';
import { EditContactModalComponent } from './tabs/project-contacts-tab/edit-contact-modal/edit-contact-modal.component';
import { ProjectContactsListActionPanelRendererComponent } from './tabs/project-contacts-tab/project-contacts-list-action-panel-renderer/project-contacts-list-action-panel-renderer.component';
import { ProjectDetailsTabComponent } from './tabs/project-details-tab/project-details-tab.component';
import { ProjectDocumentsTabComponent } from './tabs/project-documents-tab/project-documents-tab.component';
import { ProjectImportsActionsRendererComponent } from './tabs/project-imports/project-imports-actions-renderer/project-imports-actions-renderer.component';
import { ProjectImportsComponent } from './tabs/project-imports/project-imports.component';
import { ProjectOverviewTabComponent } from './tabs/project-overview-tab/project-overview-tab.component';
import { UpdateLedgerStageModalComponent } from './update-ledger-stage-modal/update-ledger-stage-modal.component';

import { DocumentTemplatesModule } from '../document-templates/document-templates.module';
import { InvoiceItemsGridComponent } from './accounting/invoice-items-grid/invoice-items-grid.component';
import { FormatService } from './billing-rule/services/format.service';
import { ClosingStatementModalComponent } from './closing-statement-modal/closing-statement-modal.component';
import { FirmFeeExpenseWorksheetModalComponent } from './firm-fee-expense-worksheet-modal/firm-fee-expense-worksheet-modal.component';
import { ProjectDeficienciesListComponent } from './project-deficiencies-list/project-deficiencies-list.component';
import { DisbursementsPaymentRequestModalComponent } from './project-disbursement-claimant-summary/modals/disbursements-payment-request-modal/disbursements-payment-request-modal.component';
import { DisbursementPaymentRequestConfigStepComponent } from './project-disbursement-claimant-summary/modals/disbursements-payment-request-modal/steps/disbursement-payment-request-config-step/disbursement-payment-request-config-step';
import { DisbursementPaymentRequestResultStepComponent } from './project-disbursement-claimant-summary/modals/disbursements-payment-request-modal/steps/disbursement-payment-request-result-step/disbursement-payment-request-result-step.component';
import { DisbursementPaymentRequestReviewStepComponent } from './project-disbursement-claimant-summary/modals/disbursements-payment-request-modal/steps/disbursement-payment-request-review-step/disbursement-payment-request-review-step.component';
import { PaymentTypesConfigStepComponent } from './project-disbursement-claimant-summary/modals/generate-payment-request-modal/steps/payment-types-config-step/payment-types-config-step.component';
import { PaymentsProcessingBarComponent } from './project-disbursement-claimant-summary/modals/generate-payment-request-modal/steps/payments-processing-bar/payments-processing-bar.component';
import { PaymentsResultsStepComponent } from './project-disbursement-claimant-summary/modals/generate-payment-request-modal/steps/payments-results-step/payments-results-step.component';
import { PaymentsReviewStepComponent } from './project-disbursement-claimant-summary/modals/generate-payment-request-modal/steps/payments-review-step/payments-review-step.component';
import { TopPaymentRequstProgressBarComponent } from './project-disbursement-claimant-summary/modals/generate-payment-request-modal/top-progress-bar/top-progress-bar.component';
import { DisbursementGroupConfigStepComponent } from './project-disbursement-claimant-summary/modals/update-disbursement-group-modal/steps/disbursement-group-config-step/disbursement-group-config-step.component';
import { UpdateDisbursementGroupModalComponent } from './project-disbursement-claimant-summary/modals/update-disbursement-group-modal/update-disbursement-group-modal.component';
import { SPIStatusRendererComponent } from './project-disbursement-claimant-summary/renderers/spi-status-renderer/spi-status-renderer.component';
import { ClaimantStageRendererComponent } from './project-disbursement-claimant-summary/renderers/stage-render/claimant-stage-renderer.component';
import { PaymentQueueListComponent } from './project-disbursement-payment-queue/payment-queue-list/payment-queue-list.component';
import { ProjectDisbursementPaymentQueueComponent } from './project-disbursement-payment-queue/project-disbursement-payment-queue.component';
import { PaymentQueueRendererComponent } from './project-disbursement-payment-queue/renderers/payment-queue-buttons-renderer';
import * as ProjectDisbursementPaymentQueueEffects from './project-disbursement-payment-queue/state/effects';
import { PaymentRequestsListButtonsRendererComponent } from './project-disbursement-payment-requests/payment-requests-list-buttons-renderer/payment-requests-list-buttons-renderer.component';
import { PaymentRequestsListComponent } from './project-disbursement-payment-requests/payment-requests-list/payment-requests-list.component';
import { ProjectDisbursementPaymentRequestsComponent } from './project-disbursement-payment-requests/project-disbursement-payment-requests.component';
import { FirmMoneyMovementComponent } from './project-ledger-settings/firm-money-movement/firm-money-movement.component';
import { OrgPaymentStatusListComponent } from './project-org-payment-status/org-payment-status-list/org-payment-status-list.component';
import { ProjectOrganizationActionsRendererComponent } from './project-organization-list/project-organization-actions-renderer/project-organization-actions-renderer.component';
import { ProjectOrganizationListComponent } from './project-organization-list/project-organization-list.component';
import { ProjectPortalDeficienciesListComponent } from './project-portal-deficiencies-list/project-portal-deficiencies-list.component';
import { ProjectReceivableItemComponent } from './project-receivables/project-receivable-item/project-receivable-item.component';
import { ProjectReceivablesComponent } from './project-receivables/project-receivables.component';
import { AccountingDetailsSectionComponent } from './sections/accounting-details-section.component';
import { ProjectContactsSectionComponent } from './sections/project-contacts-section.component';
import { ProjectDeficienciesSectionComponent } from './sections/project-deficiencies-section.component';
import { ProjectOrganizationsSectionComponent } from './sections/project-organizations-section.component';
import { ProjectPortalDeficienciesSectionComponent } from './sections/project-portal-deficiencies-section.component';
import { ProjectContactsTabComponent } from './tabs/project-contacts-tab/project-contacts-tab.component';
import { ViewContactModalComponent } from './tabs/project-contacts-tab/view-contact-modal/view-contact-modal.component';
import { ProjectNotesComponent } from './tabs/project-notes/project-notes.component';
import { UpdateByActionTemplateIdModalComponent } from './update-by-action-template-id-modal/update-by-action-template-id-modal.component';

import { CallCenterModule } from '../call-center/call-center.module';
import { ReleasePacketActionsRendererComponent } from '../claimants/probate-details/release-packet-tracking/actions-renderer/release-packet-actions-renderer.component';
import { PaymentQueueModule } from '../payment-queue/payment-queue.module';
import { QsfSweepModule } from '../qsf-sweep/qsf-sweep.module';
import { UploadBulkDocumentEffects } from '../shared/state/upload-bulk-document/effects';
import { BillingRulesSelectListComponent } from './billing-rule/fee-cap-modal/billing-rules-select-list/billing-rules-select-list.component';
import { FeeCapModalComponent } from './billing-rule/fee-cap-modal/fee-cap-modal.component';
import { FeeSplitListActionsRendererComponent } from './billing-rule/fee-split-list/fee-split-list-actions-renderer/fee-split-list-actions-renderer.component';
import { DisbursementWorksheetModalModule } from './disbursement-worksheet-modal/disbursement-worksheet-modal.module';
import { ProjectDeficienciesSettingModule } from './project-deficiencies-setting/project-deficiencies-setting.module';
import { ClaimantSummaryRollupListComponent } from './project-disbursement-claimant-summary-rollup/claimant-summary-rollup-list/claimant-summary-rollup-list.component';
import { ClaimantSummaryRollupComponent } from './project-disbursement-claimant-summary-rollup/claimant-summary-rollup.component';
import { NetPaidInFullRendererComponent } from './project-disbursement-claimant-summary-rollup/renderers/net-paid-in-full-renderer/net-paid-in-full-renderer.component';
import { ClaimantsSummaryRollupEffects } from './project-disbursement-claimant-summary-rollup/state/effects';
import { CriticalDeficienciesListComponent } from './project-disbursement-claimant-summary/modals/generate-payment-request-modal/steps/payments-deficiency-summary/critical-deficiencies-list/critical-deficiencies-list.component';
import { PaymentsDeficiencySummaryComponent } from './project-disbursement-claimant-summary/modals/generate-payment-request-modal/steps/payments-deficiency-summary/payments-deficiency-summary.component';
import { WarningDeficienciesListComponent } from './project-disbursement-claimant-summary/modals/generate-payment-request-modal/steps/payments-deficiency-summary/warning-deficiencies-list/warning-deficiencies-list.component';
import { GenerateTransferRequestModalComponent } from './project-disbursement-claimant-summary/modals/generate-transfer-request-modal/generate-transfer-request-modal.component';
import { TransferConfigStepComponent } from './project-disbursement-claimant-summary/modals/generate-transfer-request-modal/steps/transfer-config-step/transfer-config-step.component';
import { TransferProcessingBarComponent } from './project-disbursement-claimant-summary/modals/generate-transfer-request-modal/steps/transfer-processing-bar/transfer-processing-bar.component';
import { TransferResultStepComponent } from './project-disbursement-claimant-summary/modals/generate-transfer-request-modal/steps/transfer-result-step/transfer-result-step.component';
import { TransfersDeficiencySummaryComponent } from './project-disbursement-claimant-summary/modals/generate-transfer-request-modal/steps/transfers-deficiency-summary/transfers-deficiency-summary.component';
import { TransfersReviewStepComponent } from './project-disbursement-claimant-summary/modals/generate-transfer-request-modal/steps/transfers-review-step/transfers-review-step.component';
import { UpdateFundedDateSelectedList } from './project-disbursement-claimant-summary/modals/update-funded-date-modal/selected-list/update-funded-date-selected-list.component';
import { UpdateFundedDateModalComponent } from './project-disbursement-claimant-summary/modals/update-funded-date-modal/update-funded-date-modal.component';
import { ProjectDisbursementClosingStatementListComponent } from './project-disbursement-closing-statement-list/project-disbursement-closing-statement-list.component';
import { BatchDetailsModalComponent } from './project-disbursement-closing-statement/batch-details-modal/batch-details-modal.component';
import { ProjectDisbursementClosingStatementComponent } from './project-disbursement-closing-statement/project-disbursement-closing-statement.component';
import { ClosingStatementRendererComponent } from './project-disbursement-closing-statement/renderers/closing-statement-buttons-renderer';
import { DeleteDisbursementGroupModalComponent } from './project-disbursement-groups/delete-disbursement-group-modal/delete-disbursement-group-modal.component';
import { AccountRendererComponent } from './project-disbursement-payment-queue/renderers/account-renderer/account-renderer-component';
import { BankruptcyStatusRendererComponent } from './project-disbursement-payment-queue/renderers/bk-status-renderer/bk-status-renderer.component';
import { ManualPaymentRequestComponent } from './project-disbursement-payment-requests/manual-payment-request/manual-payment-request.component';
import { PaymentDetailsStepComponent } from './project-disbursement-payment-requests/manual-payment-request/steps/payment-details-step/payment-details-step.component';
import { UploadTemplateAndAttachmentsStepComponent } from './project-disbursement-payment-requests/manual-payment-request/steps/upload-template-and-attachments-step/upload-template-and-attachments-step.component';
import { OrganizationMessageModalComponent } from './project-messaging/organization-message-modal/organization-message-modal.component';
import { ProjectMessagingListComponent } from './project-messaging/project-messaging-list/project-messaging-list.component';
import { ProjectMessagingPanelRendererComponent } from './project-messaging/project-messaging-list/project-messaging-panel-renderer/project-messaging-panel-renderer';
import { ProjectMessagingComponent } from './project-messaging/project-messaging.component';
import { ProjectOrgPaymentStatusComponent } from './project-org-payment-status/project-org-payment-status.component';
import { ProjectReportingDetailsComponent } from './project-reporting/project-reporting-details/project-reporting-details.component';
import { ProjectReportingListComponent } from './project-reporting/project-reporting-list/project-reporting-list.component';
import { ProjectReporting } from './project-reporting/project-reporting.component';
import { ProjectScheduleReportFormComponent } from './project-reporting/project-schedule-report-form/project-schedule-report-form.component';
import { ScheduleReportModalComponent } from './project-reporting/schedule-report-modal/schedule-report-modal.component';
import { AssignedUserComponent } from './project-scope-of-work/assigned-user/assigned-user.component';
import { CopySettingsModalComponent } from './project-scope-of-work/modals/copy-settings-modal/copy-settings-modal.component';
import { ProductDateComponent } from './project-scope-of-work/product-date/product-date.component';
import { ProjectScopeStatusComponent } from './project-scope-of-work/project-scope-status/project-scope-status.component';
import { ProjectCommunicationsTabComponent } from './tabs/project-communications-tab/project-communications-tab.component';
import { ContactsListReportingComponent } from './tabs/project-contacts-tab/contacts-list-reporting/contacts-list-reporting.component';
import { ContactsListComponent } from './tabs/project-contacts-tab/contacts-list/contacts-list.component';
import { ProductScopeContactsListComponent } from './tabs/project-contacts-tab/product-scope-contacts-list/product-scope-contacts-list.component';
import { InfoChartsComponent } from './tabs/project-overview-tab/info-charts/info-charts.component';
import { UpdateByActionTemplateIdAllRecordsListComponent } from './update-by-action-template-id-modal/grids/all-records-list/update-by-action-template-id-all-records-list.component';
import { UpdateByActionTemplateIdErrorsListComponent } from './update-by-action-template-id-modal/grids/errors-list/update-by-action-template-id-errors-list.component';
import { UpdateByActionTemplateIdInsertsListComponent } from './update-by-action-template-id-modal/grids/inserts-list/update-by-action-template-id-inserts-list.component';
import { UpdateByActionTemplateIdNoUpdatesListComponent } from './update-by-action-template-id-modal/grids/no-updates-list/update-by-action-template-id-no-updates-list.component';
import { UpdateByActionTemplateIdQueuedListComponent } from './update-by-action-template-id-modal/grids/queued-list/update-by-action-template-id-queued-list.component';
import { UpdateByActionTemplateIdUpdatesListComponent } from './update-by-action-template-id-modal/grids/updates-list/update-by-action-template-id-updates-list.component';
import { UpdateByActionTemplateIdWarningsListComponent } from './update-by-action-template-id-modal/grids/warnings-list/update-by-action-template-id-warnings-list.component';
import { ProgressBarModalComponent } from './update-by-action-template-id-modal/progress-bar-modal/progress-bar-modal.component';
import { UpdateByActionTemplateIdGridComponent } from './update-by-action-template-id-modal/update-by-action-template-id-grid/update-by-action-template-id-grid.component';
import { UpdateByActionTemplateIdLedgersListComponent } from './update-by-action-template-id-modal/update-by-action-template-id-ledgers-list/update-by-action-template-id-ledgers-list.component';
import { UpdateByActionTemplateIdResultsComponent } from './update-by-action-template-id-modal/update-by-action-template-id-results/update-by-action-template-id-results.component';
import { UpdateByActionTemplateIdReviewComponent } from './update-by-action-template-id-modal/update-by-action-template-id-review/update-by-action-template-id-review.component';
import { UpdateStageDeficienciesCriticalListComponent } from './update-ledger-stage-modal/update-ledger-stage-deficiency-summary/critical-deficiencies-list/update-stage-deficiencies-critical-list.component';
import { UpdateLedgerStageDeficiencySummaryComponent } from './update-ledger-stage-modal/update-ledger-stage-deficiency-summary/update-ledger-stage-deficiency-summary.component';
import { UpdateStageDeficienciesWarningListComponent } from './update-ledger-stage-modal/update-ledger-stage-deficiency-summary/warning-deficiencies-list/update-stage-deficiencies-warning-list.component';
import { ReviewPaymentsGridComponent } from './project-disbursement-payment-requests/manual-payment-request/steps/review-payments-details-step/grid/review-payments-grid/review-payments-grid.component';
import { ReviewPaymentsDetailsStepComponent } from './project-disbursement-payment-requests/manual-payment-request/steps/review-payments-details-step/review-payments-details-step.component';
import { PaymentsAllRecordsComponent } from './project-disbursement-payment-requests/manual-payment-request/steps/review-payments-details-step/grid/payments-all-records/payments-all-records.component';
import { PaymentsErrorsComponent } from './project-disbursement-payment-requests/manual-payment-request/steps/review-payments-details-step/grid/payments-errors/payments-errors.component';
import { PaymentsWarningsComponent } from './project-disbursement-payment-requests/manual-payment-request/steps/review-payments-details-step/grid/payments-warnings/payments-warnings.component';
import { PaymentsQueuedComponent } from './project-disbursement-payment-requests/manual-payment-request/steps/review-payments-details-step/grid/payments-queued/payments-queued.component';
import { VoidClosingStatmentDialogModelComponent } from './project-disbursement-closing-statement/void-closing-statment-dialog-model/void-closing-statment-dialog-model.component';
import { ProjectDashboardComponent } from './project-dashboard/project-dashboard.component';
import { FirmLandingPageModule } from '@app/modules/firm-landing-page/firm-landing-page.module';
import { ProjectDashboardChartsComponent } from './project-dashboard-charts/project-dashboard-charts.component';

FusionChartsModule.fcRoot(FusionCharts, Charts, FusionTheme);

@NgModule({
  declarations: [
    ProjectDetailsComponent,
    GeneralInfoTabComponent,
    ProjectActionPanelCellRendererComponent,
    ProjectOverviewSectionComponent,
    ProjectServicesSectionComponent,
    ProjectSideNavComponent,
    ProjectClaimantsOverviewTabComponent,
    ProjectImportsComponent,
    ProjectNotesComponent,
    ProjectImportsActionsRendererComponent,
    ProjectClaimantListSectionComponent,
    OrgPaymentStatusListComponent,
    ProbateSectionComponent,
    ReleaseSectionComponent,
    ClaimsSectionComponent,
    ProjectOverviewTabComponent,
    ProjectDetailsTabComponent,
    BankruptcySectionComponent,
    LienResolutionSectionComponent,
    ProjectPaymentsSectionComponent,
    ProjectPaymentsComponent,
    ProjectDisbursementElectionFormsComponent,
    ElectionFormsListComponent,
    PaymentQueueListComponent,
    PaymentQueueRendererComponent,
    AccountRendererComponent,
    BankruptcyStatusRendererComponent,
    ProjectDisbursementPaymentQueueComponent,
    ProjectLedgerSettings,
    CommonSettingsComponent,
    ClosingStatementSettingsComponent,
    DeliverySettingsComponent,
    DigitalPaymentSettingsComponent,
    FormulaSettingsComponent,
    ProjectPaymentsDetailsComponent,
    ProjectDisbursementGroupsComponent,
    CreateDisbursementGroupModalComponent,
    EditDisbursementGroupModalComponent,
    DeleteDisbursementGroupModalComponent,
    ProjectDisbursementGroupList,
    StatusRendererComponent,
    ProjectDisbursementClaimantSummaryComponent,
    ClaimantSummaryListComponent,
    ClaimantSummaryRollupComponent,
    ClaimantSummaryRollupListComponent,
    ClaimantSummaryButtonsRendererComponent,
    ProjectDocumentsTabComponent,
    ElectionFormsRendererComponent,
    ProjectDisbursementNotesComponent,
    ProjectChartOfAccountsComponent,
    CreateProjectModalComponent,
    ProjectSettingsSectionComponent,
    ProjectContactsSectionComponent,
    AddContactModalComponent,
    EditContactModalComponent,
    ContactsListComponent,
    ContactsListReportingComponent,
    ProductScopeContactsListComponent,
    ViewContactModalComponent,
    ProjectContactsTabComponent,
    ProjectScopeOfWorkComponent,
    FirmFeeExpenseWorksheetModalComponent,
    UpdateByActionTemplateIdLedgersListComponent,
    UpdateLedgerStageModalComponent,
    UpdateByActionTemplateIdModalComponent,
    UpdateByActionTemplateIdReviewComponent,
    UpdateByActionTemplateIdResultsComponent,
    ProgressBarModalComponent,
    UpdateByActionTemplateIdGridComponent,
    BillingRulesListComponent,
    BillingRules,
    BillingRuleCreationComponent,
    FeeCapsListComponent,
    GeneratePaymentRequestModalComponent,
    BrServicesCellRendererComponent,
    BillingRuleFormComponent,
    BillingRuleDetailsComponent,
    OutcomeBasedPricingModalComponent,
    OutcomeBasedPricingViewComponent,
    FeeSplitComponent,
    FeeSplitListComponent,
    PaymentsReviewStepComponent,
    PaymentsDeficiencySummaryComponent,
    WarningDeficienciesListComponent,
    CriticalDeficienciesListComponent,
    PaymentsResultsStepComponent,
    PaymentsProcessingBarComponent,
    TopPaymentRequstProgressBarComponent,
    CopySettingsModalComponent,
    PaymentTypesConfigStepComponent,
    ClosingStatementModalComponent,
    ProjectOrganizationsSectionComponent,
    ProjectDeficienciesSectionComponent,
    ProjectPortalDeficienciesSectionComponent,
    ProjectOrganizationListComponent,
    ProjectOrganizationActionsRendererComponent,
    ProjectContactsListActionPanelRendererComponent,
    FirmMoneyMovementComponent,
    EngagementProductsComponent,
    EngagementConditionsComponent,
    ProductCategoryStatusComponent,
    ProductDateComponent,
    ProjectScopeStatusComponent,
    AssignedUserComponent,
    AccountingDetailsSectionComponent,
    InvoiceItemsGridComponent,
    ProjectReceivablesComponent,
    ProjectReceivableItemComponent,
    ProjectDeficienciesListComponent,
    ProjectPortalDeficienciesListComponent,
    UpdateDisbursementGroupModalComponent,
    DisbursementGroupConfigStepComponent,
    ClaimantStageRendererComponent,
    DisbursementsPaymentRequestModalComponent,
    ProjectDisbursementPaymentRequestsComponent,
    PaymentRequestsListComponent,
    PaymentRequestsListButtonsRendererComponent,
    DisbursementPaymentRequestConfigStepComponent,
    DisbursementPaymentRequestReviewStepComponent,
    DisbursementPaymentRequestResultStepComponent,
    UpdateByActionTemplateIdAllRecordsListComponent,
    UpdateByActionTemplateIdErrorsListComponent,
    UpdateByActionTemplateIdWarningsListComponent,
    UpdateByActionTemplateIdQueuedListComponent,
    UpdateByActionTemplateIdInsertsListComponent,
    UpdateByActionTemplateIdUpdatesListComponent,
    UpdateByActionTemplateIdNoUpdatesListComponent,
    UpdateLedgerStageDeficiencySummaryComponent,
    UpdateStageDeficienciesWarningListComponent,
    UpdateStageDeficienciesCriticalListComponent,
    ProjectDisbursementClosingStatementListComponent,
    ProjectDisbursementClosingStatementComponent,
    ClosingStatementRendererComponent,
    BatchDetailsModalComponent,
    ProjectCommunicationsTabComponent,
    SPIStatusRendererComponent,
    OrganizationMessageModalComponent,
    ProjectMessagingComponent,
    ProjectMessagingListComponent,
    ProjectMessagingPanelRendererComponent,
    NetPaidInFullRendererComponent,
    FeeSplitListActionsRendererComponent,
    ReleasePacketActionsRendererComponent,
    FeeCapModalComponent,
    BillingRulesSelectListComponent,
    ProjectOrgPaymentStatusComponent,
    InfoChartsComponent,
    UpdateFundedDateModalComponent,
    UpdateFundedDateSelectedList,
    GenerateTransferRequestModalComponent,
    TransfersReviewStepComponent,
    TransferConfigStepComponent,
    TransferProcessingBarComponent,
    TransferResultStepComponent,
    TransfersDeficiencySummaryComponent,
    ProjectReporting,
    ProjectReportingListComponent,
    ProjectScheduleReportFormComponent,
    ScheduleReportModalComponent,
    ProjectDeficienciesRecentReportsComponent,
    ProjectReportingDetailsComponent,
    ManualPaymentRequestComponent,
    UploadTemplateAndAttachmentsStepComponent,
    PaymentDetailsStepComponent,
    ReviewPaymentsDetailsStepComponent,
    ReviewPaymentsGridComponent,
    PaymentsAllRecordsComponent,
    PaymentsErrorsComponent,
    PaymentsWarningsComponent,
    PaymentsQueuedComponent,
    VoidClosingStatmentDialogModelComponent,
    ProjectDashboardComponent,
    ProjectDashboardChartsComponent,
  ],
  providers: [FormatService, { provide: NgxMaskPipe, useClass: NgxMaskPipe }, provideNgxMask()],
  imports: [
    AgGridModule,
    CommonModule,
    ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    ProjectsRoutingModule,
    AgGridModule,
    SharedModule,
    FusionChartsModule,
    LiensModule,
    PaymentsModule,
    DisbursementsModule,
    DisbursementGroupsModule,
    AgGridModule,
    DocumentTemplatesModule,
    StoreModule.forFeature('projects_feature', ProjectsReducer),
    EffectsModule.forFeature([
      ProjectsEffects,
      ClaimantsSummaryEffects,
      ClaimantsSummaryRollupEffects,
      ElectionFormsEffects,
      ProjectDisbursementPaymentQueueEffects.PaymentQueueEffects,
      LedgeSettingsEffects,
      ScopeOfWorkEffects,
      BillingRuleEffects,
      PaymentQueueEffects,
      UploadBulkDocumentEffects
    ]),
    ModalModule.forRoot(),
    NgxMaskDirective, NgxMaskPipe,
    QuillModule,
    CallCenterModule,
    ProjectDeficienciesSettingModule,
    DisbursementWorksheetModalModule,
    QsfSweepModule,
    PaymentQueueModule, FirmLandingPageModule
  ]
})
export class ProjectsModule {}
