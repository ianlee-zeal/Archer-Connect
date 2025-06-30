import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { OrgPaymentDocumentsComponent } from './org-payment-documents.component';

const routes: Routes = [
  {
    path: '',
    component: OrgPaymentDocumentsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentInstructionDocumentsRoutingModule { }
