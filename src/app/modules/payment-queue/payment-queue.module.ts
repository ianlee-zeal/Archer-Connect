import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { PaymentQueueEffects as ProjectPaymentQueueEffects } from '@app/modules/projects/project-disbursement-payment-queue/state/effects';
import { AgGridModule } from 'ag-grid-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { PaymentQueueRoutingModule } from './payment-queue-routing.module';
import { GlobalPaymentQueueListComponent } from './payment-queue-list/payment-queue-list.component';
import { paymentQueueReducerWrapper } from './state/reducer';
import { PaymentQueueEffects } from './state/effects';
import { PaymentQueueSectionComponent } from './payment-queue-section.component';
import { SharedModule } from '../shared/shared.module';
import { SelectedPaymentQueueListComponent } from './update-lien-payment-stage-modal/selected-payment-queue-list/selected-payment-queue-list.component';
import { UpdateLienPaymentStageModalComponent } from './update-lien-payment-stage-modal/update-lien-payment-stage-modal.component';
import { LienPaymentStageValidationResultsComponent } from './update-lien-payment-stage-modal/lien-payment-stage-validation-results/lien-payment-stage-validation-results.component';
import { DocumentTemplatesModule } from '../document-templates/document-templates.module';
import { ClaimantsSummaryEffects } from '../projects/project-disbursement-claimant-summary/state/effects';
import { CopySpecialPaymentInstructionsModalComponent } from './copy-special-payment-instructions-modal/copy-special-payment-instructions-modal.component';
import { CopySpecialPaymentInstructionsSelectedListComponent } from './copy-special-payment-instructions-modal/selected-list/copy-special-payment-instructions-selected-list.component';
import { CopySpecialPaymentInstructionsValidationReviewComponent } from './copy-special-payment-instructions-modal/copy-validation-review/copy-special-payment-instructions-validation-review.component';
import { CopySpecialPaymentInstructionsIdGridComponent } from './copy-special-payment-instructions-modal/copy-special-payment-instructions-id-grid/copy-special-payment-instructions-id-grid.component';
import { CopySpecialPaymentInstructionsRecordsListComponent } from './copy-special-payment-instructions-modal/records-list/copy-special-payment-instructions-records-list.component';
import { CopySpecialPaymentInstructionsResultsComponent } from './copy-special-payment-instructions-modal/copy-results/copy-special-payment-instructions-results.component';
import { InvoiceArcherFeesModalComponent } from './invoice-archer-fees-modal/invoice-archer-fees-modal.component';
import { InvoiceArcherFeesQueuedListComponent } from './invoice-archer-fees-modal/invoice-archer-fees-queued-list/invoice-archer-fees-queued-list.component';
import { InvoiceArcherFeesGridComponent } from './invoice-archer-fees-modal/invoice-archer-fees-grid/invoice-archer-fees-grid.component';
import { InvoiceArcherFeesDeficiencySummaryComponent } from './invoice-archer-fees-modal/invoice-archer-fees-defficiency-summary/invoice-archer-fees-deficiency-summary.component';
import { InvoiceArcherFeesDeficienciesWarningListComponent } from './invoice-archer-fees-modal/invoice-archer-fees-defficiency-summary/warning-deficiencies-list/invoice-archer-fees-deficiencies-warning-list.component';
import { InvoiceArcherFeesDeficienciesCriticalListComponent } from './invoice-archer-fees-modal/invoice-archer-fees-defficiency-summary/critical-deficiencies-list/invoice-archer-fees-deficiencies-critical-list.component';
import { InvoiceArcherFeesErrorWarningListComponent } from './invoice-archer-fees-modal/invoice-archer-fees-error-list/invoice-archer-fees-error-list.component';
import { AuthorizeArcherFeesModalComponent } from './authorize-archer-fees-modal/authorize-archer-fees-modal.component';
import { AuthorizeLienEntriesModalComponent } from './authorize-lien-entries-modal/authorize-lien-entries-modal.component';
import { AuthorizeEntriesDeficienciesCriticalListComponent } from './authorize-entries-modal/deficiency-summary/critical-deficiencies-list/deficiencies-critical-list.component';
import { AuthorizeEntriesDeficienciesWarningListComponent } from './authorize-entries-modal/deficiency-summary/warning-deficiencies-list/deficiencies-warning-list.component';
import { AuthorizeEntriesDeficiencySummaryComponent } from './authorize-entries-modal/deficiency-summary/authorize-entries-deficiency-summary.component';
import { AuthorizeEntriesSelectedListComponent } from './authorize-entries-modal/selected-list/authorize-entries-selected-list.component';
import { AuthorizeEntriesResultsGridComponent } from './authorize-entries-modal/results-grid/authorize-entries-results-grid.component';
import { AuthorizeEntriesResultsListComponent } from './authorize-entries-modal/results-list/results-list.component';
import { AuthorizeEntriesResultsComponent } from './authorize-entries-modal/results/authorize-entries-results.component';
import { AuthorizeEntriesModalComponent } from './authorize-entries-modal/authorize-entries-modal.component';
import { RefundTransferRequestFormStepComponent } from './refund-transfer-request/steps/request-form-step/request-form-step.component';
import { RefundTransferRequestModalComponent } from './refund-transfer-request/refund-transfer-request-modal.component';
import { RefundTransferRequestReviewStepComponent } from './refund-transfer-request/steps/review-step/refund-transfer-request-review-step.component';
import { RefundTransferRequestRecordsListComponent } from './refund-transfer-request/components/records-list/refund-transfer-request-records-list.component.component';
import { RefundTransferRequestSummaryGridComponent } from './refund-transfer-request/components/summary-grid/refund-transfer-request-summary-grid.component';
import { ManualEntryStepComponent } from './refund-transfer-request/steps/manual-entry-step/manual-entry-step.component';
import { RefundTransferRequestResultStepComponent } from './refund-transfer-request/steps/result-step/refund-transfer-request-result-step.component';
import { RefundTransferRequestResultGridComponent } from './refund-transfer-request/components/result-grid/refund-transfer-request-result-grid.component.component';
import { RefundInfoCardComponent } from './refund-transfer-request/components/info-card/refund-info-card.component';
import { AuthorizeLedgerEntriesModalComponent } from './authorize-ledger-entries/authorize-ledger-entries-modal.component';
import { AuthorizeLedgerEntriesReviewComponent } from './authorize-ledger-entries/components/authorize-ledger-entries-review/authorize-ledger-entries-review.component';
import { AuthorizedLedgersReviewGridComponent } from './authorize-ledger-entries/components/authorize-ledger-entries-review/authorized-ledgers-review-grid/authorized-ledgers-review-grid.component';
import { UnauthorizedLedgersReviewGridComponent } from './authorize-ledger-entries/components/authorize-ledger-entries-review/unauthorized-ledgers-review-grid/unauthorized-ledgers-review-grid.component';
import { AuthorizeLedgerEntriesResultComponent } from './authorize-ledger-entries/components/authorize-ledger-entries-result/authorize-ledger-entries-result.component';
import { AuthorizeLedgerEntriesResultGridComponent } from './authorize-ledger-entries/components/authorize-ledger-entries-result/authorize-ledger-entries-result-grid/authorize-ledger-entries-result-grid.component';

@NgModule({
  declarations: [
    GlobalPaymentQueueListComponent,
    PaymentQueueSectionComponent,
    UpdateLienPaymentStageModalComponent,
    CopySpecialPaymentInstructionsModalComponent,
    SelectedPaymentQueueListComponent,
    LienPaymentStageValidationResultsComponent,
    CopySpecialPaymentInstructionsSelectedListComponent,
    CopySpecialPaymentInstructionsValidationReviewComponent,
    CopySpecialPaymentInstructionsResultsComponent,
    CopySpecialPaymentInstructionsRecordsListComponent,
    CopySpecialPaymentInstructionsIdGridComponent,
    InvoiceArcherFeesModalComponent,
    InvoiceArcherFeesQueuedListComponent,
    InvoiceArcherFeesGridComponent,
    InvoiceArcherFeesDeficiencySummaryComponent,
    InvoiceArcherFeesDeficienciesCriticalListComponent,
    InvoiceArcherFeesDeficienciesWarningListComponent,
    InvoiceArcherFeesErrorWarningListComponent,
    AuthorizeArcherFeesModalComponent,
    AuthorizeLienEntriesModalComponent,
    AuthorizeEntriesSelectedListComponent,
    AuthorizeEntriesDeficiencySummaryComponent,
    AuthorizeEntriesDeficienciesCriticalListComponent,
    AuthorizeEntriesDeficienciesWarningListComponent,
    AuthorizeEntriesResultsListComponent,
    AuthorizeEntriesResultsComponent,
    AuthorizeEntriesResultsGridComponent,
    AuthorizeEntriesModalComponent,
    RefundTransferRequestFormStepComponent,
    RefundTransferRequestModalComponent,
    RefundTransferRequestReviewStepComponent,
    RefundTransferRequestRecordsListComponent,
    RefundTransferRequestSummaryGridComponent,
    RefundTransferRequestResultStepComponent,
    RefundTransferRequestResultGridComponent,
    RefundInfoCardComponent,
    RefundTransferRequestSummaryGridComponent,
    ManualEntryStepComponent,
    AuthorizeLedgerEntriesModalComponent,
    AuthorizeLedgerEntriesReviewComponent,
    AuthorizedLedgersReviewGridComponent,
    UnauthorizedLedgersReviewGridComponent,
    AuthorizeLedgerEntriesResultComponent,
    AuthorizeLedgerEntriesResultGridComponent,
  ],
  exports: [
    PaymentQueueSectionComponent,
    UpdateLienPaymentStageModalComponent,
    CopySpecialPaymentInstructionsModalComponent,
    SelectedPaymentQueueListComponent,
    LienPaymentStageValidationResultsComponent,
    CopySpecialPaymentInstructionsSelectedListComponent,
    CopySpecialPaymentInstructionsValidationReviewComponent,
    CopySpecialPaymentInstructionsResultsComponent,
    CopySpecialPaymentInstructionsRecordsListComponent,
    CopySpecialPaymentInstructionsIdGridComponent,
    InvoiceArcherFeesModalComponent,
    InvoiceArcherFeesQueuedListComponent,
    InvoiceArcherFeesGridComponent,
    InvoiceArcherFeesDeficiencySummaryComponent,
    InvoiceArcherFeesDeficienciesCriticalListComponent,
    InvoiceArcherFeesDeficienciesWarningListComponent,
    InvoiceArcherFeesErrorWarningListComponent,
    AuthorizeArcherFeesModalComponent,
    AuthorizeLienEntriesModalComponent,
    AuthorizeEntriesSelectedListComponent,
    AuthorizeEntriesDeficiencySummaryComponent,
    AuthorizeEntriesDeficienciesCriticalListComponent,
    AuthorizeEntriesDeficienciesWarningListComponent,
    AuthorizeEntriesResultsListComponent,
    AuthorizeEntriesResultsComponent,
    AuthorizeEntriesResultsGridComponent,
    AuthorizeEntriesModalComponent,
    RefundTransferRequestFormStepComponent,
    RefundTransferRequestModalComponent,
    RefundTransferRequestReviewStepComponent,
    RefundTransferRequestRecordsListComponent,
    RefundTransferRequestSummaryGridComponent,
    RefundTransferRequestResultStepComponent,
    RefundTransferRequestResultGridComponent,
    RefundInfoCardComponent,
    RefundTransferRequestSummaryGridComponent,
    ManualEntryStepComponent,
    AuthorizeLedgerEntriesModalComponent,
    AuthorizeLedgerEntriesReviewComponent,
    AuthorizedLedgersReviewGridComponent,
    UnauthorizedLedgersReviewGridComponent,
    AuthorizeLedgerEntriesResultComponent,
    AuthorizeLedgerEntriesResultGridComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    PaymentQueueRoutingModule,
    DocumentTemplatesModule,
    StoreModule.forFeature('payment-queue_feature', paymentQueueReducerWrapper),
    EffectsModule.forFeature([PaymentQueueEffects, ProjectPaymentQueueEffects, ClaimantsSummaryEffects]),
    AgGridModule,
    QuillModule,
    ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
  ],
})
export class PaymentQueueModule { }
