import { NgModule } from '@angular/core';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { AgGridModule } from 'ag-grid-angular';
import { SharedModule } from '@app/modules/shared/shared.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BankAccountEffects } from './state/effects';
import { reducer } from './state/reducer';
import { BankAccountsRoutingModule } from './bank-accounts-routing.module';
import { BankAccountsButtonsRendererComponent } from './renderers/bank-accounts-buttons-renderer';
import { BankAccountGeneralTabComponent } from './bank-account-general-tab/bank-account-general-tab.component';
import { BankAccountPaymentsHistoryComponent } from './bank-account-payments-history/bank-account-payments-history.component';
import { BankAccountAuditLogsComponent } from './bank-account-audit-logs/bank-account-audit-logs.component';
import { BankAccountsCreateComponent } from './bank-accounts-create/bank-accounts-create.component';
import { BankAccountDetailsComponent } from './bank-account-details/bank-account-details.component';
import { BankAccountsNotesComponent } from './bank-accounts-notes/bank-accounts-notes.component';
import { PaymentInstructionsSectionComponent } from './sections/payment-instructions-section';
import { PaymentPreferenceModalComponent } from './payment-preference-modal/payment-preference-modal.component';
import { OrgPaymentSettingsComponent } from './org-payment-settings/org-payment-settings.component';

@NgModule({
    declarations: [
        BankAccountsButtonsRendererComponent,
        BankAccountDetailsComponent,
        BankAccountGeneralTabComponent,
        BankAccountPaymentsHistoryComponent,
        BankAccountAuditLogsComponent,
        BankAccountsCreateComponent,
        BankAccountsNotesComponent,
        PaymentInstructionsSectionComponent,
        PaymentPreferenceModalComponent,
        OrgPaymentSettingsComponent,
    ],
    providers: [provideNgxMask()],
    exports: [],
    imports: [
        ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
        FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
        CommonModule,
        SharedModule,
        BankAccountsRoutingModule,
        AgGridModule,
        StoreModule.forFeature('bankAccounts', reducer),
        EffectsModule.forFeature([BankAccountEffects]),
        NgxMaskDirective, NgxMaskPipe,
    ]
})
export class BankAccountsModule { }
