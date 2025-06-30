import { Component } from '@angular/core';
import { GridActionsRendererComponent } from '@app/entities/grid-actions-renderer-component';
import { PaymentRequestDetails } from '@app/models';

@Component({
  selector: 'app-disbursements-payment-list-actions-renderer',
  templateUrl: './disbursements-payment-list-actions-renderer.component.html',
  styleUrls: ['./disbursements-payment-list-actions-renderer.component.scss'],
})
export class DisbursementsPaymentListActionsRendererComponent extends GridActionsRendererComponent<PaymentRequestDetails> {
  get inProgress(): boolean {
    return this.params?.inProgress && this.params?.inProgress(this.params?.data);
  }

  get hidden(): boolean {
    return this.params?.hidden && this.params?.hidden(this.params?.data);
  }
}
