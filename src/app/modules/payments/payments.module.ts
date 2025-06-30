import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/modules/shared/shared.module';
import { StoreModule } from '@ngrx/store';
import { AgGridModule } from 'ag-grid-angular';
import { EffectsModule } from '@ngrx/effects';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { QuillModule } from 'ngx-quill';
import { PaymentsGridComponent } from './payments-grid/payments-grid.component';
import { Reducer } from './state/reducer';
import { PaymentsEffects } from './state/effects';
import { PaymentDetailsComponent } from './payment-details/payment-details.component';
import { PaymentsTrackingLinkComponent } from './payments-tracking-link/payments-tracking-link.component';
import { PaymentDetailsPageComponent } from './payment-details-page/payment-details-page.component';
import { StopPaymentModalComponent } from './stop-payment-request-modal/stop-payment-modal.component';
import { StopPaymentRequestDetailsComponent } from './stop-payment-request-details/stop-payment-request-details.component';
import { AddressesModule } from '../addresses/addresses.module';
import { CheckVerificationModalComponent } from './check-verification-modal/check-verification-modal.component';
import { CheckVerificationListComponent } from './check-verification-list/check-verification-list.component';
import { CheckVerificationListActionsRendererComponent } from './check-verification-list/check-verification-list-actions-renderer/check-verification-list-actions-renderer.component';
import { SPRCheckVerificationListComponent } from './stop-payment-request-modal/spr-check-verification-list/spr-check-verification-list.component';
import { PaymentItemDetailListComponent } from './payment-item-detail-list/payment-item-detail-list.component';
import { PaymentsRoutingModule } from './payments-routing.module';
import { PaymentsSectionComponent } from './payments-section/payments-section.component';
import { TransfersGridComponent } from './transfers-grid/transfers-grid.component';
import { TransferDetailsComponent } from './transfer-details/transfer-details.component';
import { TransferDetailsPageComponent } from './transfer-details-page/transfer-details-page.component';
import { TransferItemDetailListComponent } from './transfer-item-detail-list/transfer-item-detail-list.component';

@NgModule({
  declarations: [
    PaymentsSectionComponent,
    PaymentDetailsPageComponent,
    PaymentsGridComponent,
    PaymentDetailsComponent,
    PaymentsTrackingLinkComponent,
    StopPaymentModalComponent,
    StopPaymentRequestDetailsComponent,
    CheckVerificationModalComponent,
    CheckVerificationListComponent,
    SPRCheckVerificationListComponent,
    CheckVerificationListActionsRendererComponent,
    PaymentItemDetailListComponent,
    TransfersGridComponent,
    TransferDetailsComponent,
    TransferDetailsPageComponent,
    TransferItemDetailListComponent,
  ],
  providers: [provideNgxMask()],
  imports: [
    CommonModule,
    SharedModule,
    PaymentsRoutingModule,
    FormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    QuillModule,
    StoreModule.forFeature('payments', Reducer),
    EffectsModule.forFeature([PaymentsEffects]),
    AgGridModule,
    ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
    AddressesModule,
    NgxMaskDirective, NgxMaskPipe,
  ],
  exports: [
    PaymentsGridComponent,
    TransfersGridComponent,
    PaymentDetailsComponent,
    TransferDetailsComponent,
    StopPaymentRequestDetailsComponent,
  ],
})
export class PaymentsModule { }
