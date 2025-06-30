import { Component } from '@angular/core';
import { GridActionsRendererComponent } from '@app/entities';
import { PaymentRequestSummary } from '@app/models';

@Component({
  selector: 'app-payment-requests-list-buttons-renderer',
  templateUrl: './payment-requests-list-buttons-renderer.component.html',
  styleUrls: ['./payment-requests-list-buttons-renderer.component.scss'],
})
export class PaymentRequestsListButtonsRendererComponent extends GridActionsRendererComponent<PaymentRequestSummary> {

}
