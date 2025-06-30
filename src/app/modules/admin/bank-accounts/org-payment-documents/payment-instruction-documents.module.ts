import { NgModule } from '@angular/core';
import { SharedModule } from '@app/modules/shared/shared.module';
import { CommonModule } from '@angular/common';
import { OrgPaymentDocumentsComponent } from './org-payment-documents.component';
import { PaymentInstructionDocumentsRoutingModule } from './payment-instruction-documents-routing.module';

@NgModule({
  declarations: [
    OrgPaymentDocumentsComponent,
  ],
  providers: [],
  exports: [],
  imports: [
    CommonModule,
    SharedModule,
    PaymentInstructionDocumentsRoutingModule,
  ],
})
export class PaymentInstructionDocumentsModule { }
