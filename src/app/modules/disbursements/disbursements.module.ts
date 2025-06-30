import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { ModalModule } from 'ngx-bootstrap/modal';
import { QuillModule } from 'ngx-quill';

import { SharedModule } from '@shared/shared.module';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { DisbursementsReducer } from './state/reducer';
import { DisbursementsEffects } from './state/effects';

import { DisbursementsListComponent } from './disbursements-list/disbursements-list.component';
import { DisbursementsRoutingModule } from './disbursements-routing.module';
import { DisbursementsListActionsRendererComponent } from './disbursements-list/disbursements-list-actions-renderer/disbursements-list-actions-renderer.component';
import { DisbursementDetailsModalComponent } from './disbursement-details-modal/disbursement-details-modal.component';
import { DisbursementsPaymentListActionsRendererComponent } from './disbursement-details-modal/disbursements-payment-list-actions-renderer/disbursements-payment-list-actions-renderer.component';
import { StopPaymentRequestListComponent } from './stop-payment-request-list/stop-payment-request-list.component';
import { DisbursementsSectionComponent } from './disbursements-section.component';
import { StopPaymentRequstListActionsRendererComponent } from './stop-payment-request-list/stop-payment-request-list-actions-renderer/stop-payment-request-list-actions-renderer.component';
import { PaymentsModule } from '../payments/payments.module';
import { AddressesModule } from '../addresses/addresses.module';
import { StopPaymentUpdateStatusModalComponent } from './stop-payment-request-list/stop-payment-update-status-modal/stop-payment-update-status-modal.component';
import { TransferRequestListComponent } from './transfer-request-list/transfer-request-list.component'
import { TransferRequestDetailsModalComponent } from './transfer-request-list/transfer-request-details-modal/transfer-request-details-modal.component'
import { TransferRequestListActionsRendererComponent } from './transfer-request-list/transfer-request-list-actions-renderer/transfer-request-list-actions-renderer.component'
import { TransferRequestItemsListActionsRendererComponent } from './transfer-request-list/transfer-request-items-list-actions-renderer/transfer-request-items-list-actions-renderer.component';

@NgModule({
    declarations: [
        DisbursementsSectionComponent,
        DisbursementsListComponent,
        DisbursementsListActionsRendererComponent,
        DisbursementDetailsModalComponent,
        DisbursementsPaymentListActionsRendererComponent,
        StopPaymentRequestListComponent,
        StopPaymentRequstListActionsRendererComponent,
        StopPaymentUpdateStatusModalComponent,
        TransferRequestListComponent,
        TransferRequestDetailsModalComponent,
        TransferRequestListActionsRendererComponent,
        TransferRequestItemsListActionsRendererComponent,
    ],
    providers: [provideNgxMask()],
    exports: [],
    imports: [
        CommonModule,
        ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
        FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
        QuillModule,
        SharedModule,
        AddressesModule,
        PaymentsModule,
        DisbursementsRoutingModule,
        ModalModule.forRoot(),
        AgGridModule,
        StoreModule.forFeature('disbursements_feature', DisbursementsReducer),
        EffectsModule.forFeature([
            DisbursementsEffects,
        ]),
        NgxMaskDirective, NgxMaskPipe,
    ]
})
export class DisbursementsModule {
}
