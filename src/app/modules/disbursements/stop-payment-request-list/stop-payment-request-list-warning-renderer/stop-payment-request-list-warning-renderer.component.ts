import { Component } from '@angular/core';
import { IconHelper } from '@app/helpers/icon-helper';
import { BaseCellRendererComponent } from '@app/modules/shared/_abstractions/base-cell-renderer';

@Component({
  selector: 'app-stop-payment-request-list-warning-renderer',
  templateUrl: './stop-payment-request-list-warning-renderer.component.html',
  styleUrls: ['./stop-payment-request-list-warning-renderer.component.scss'],
})
export class StopPaymentRequestListWarningRendererComponent extends BaseCellRendererComponent {
  getIcon(updatedDate: any): string {
    return IconHelper.getSPRWarningIcon(updatedDate);
  }
}
