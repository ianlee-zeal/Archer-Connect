import { GridActionsRendererComponent } from '@app/entities/grid-actions-renderer-component';
import { PaymentInstruction } from '@app/models/payment-instruction';
import { Component } from '@angular/core';

@Component({
  selector: 'app-payment-instructions-grid-actions-renderer',
  templateUrl: './payment-instructions-grid-actions-renderer.component.html',
  styleUrls: ['./payment-instructions-grid-actions-renderer.component.scss'],
})
export class PaymentInstructionsGridActionsRendererComponent extends GridActionsRendererComponent<PaymentInstruction> {
}
