import { Component } from '@angular/core';
import { GridActionsRendererComponent } from '@app/entities/grid-actions-renderer-component';
import { StopPaymentRequest } from '@app/models/stop-payment-request';

@Component({
  selector: 'app-stop-payment-request-list-actions-renderer',
  templateUrl: './stop-payment-request-list-actions-renderer.component.html',
  styleUrls: ['./stop-payment-request-list-actions-renderer.component.scss'],
})
export class StopPaymentRequstListActionsRendererComponent extends GridActionsRendererComponent<StopPaymentRequest> {
}
