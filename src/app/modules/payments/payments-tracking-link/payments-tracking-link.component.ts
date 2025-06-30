import { Component, Input } from '@angular/core';
import { UrlHelper } from '@app/helpers/url-helper';

@Component({
  selector: 'app-payments-tracking-link',
  templateUrl: './payments-tracking-link.component.html',
})
export class PaymentsTrackingLinkComponent {
  @Input() public providerCode: string;

  @Input() public trackingNumber: string;

  public openTracking(): void {
    const url = UrlHelper.getPostalTrackingUrl(this.providerCode, this.trackingNumber);
    window.open(url, '_blank');
  }
}
