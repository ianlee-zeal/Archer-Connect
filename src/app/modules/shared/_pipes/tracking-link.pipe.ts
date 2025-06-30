import { Pipe, PipeTransform } from '@angular/core';
import { UrlHelper } from '@app/helpers/url-helper';

@Pipe({ name: 'trackingPipe' })
export class TrackingLinkPipe implements PipeTransform {

  transform(carrier: string, trackingNumber: string ): string {
    if (trackingNumber && carrier) {
      const trackingLink = UrlHelper.getPostalTrackingUrl(carrier, trackingNumber);
      return trackingLink ? `<a href="${trackingLink}" target="_blank">${trackingNumber}</a>` : trackingNumber;
    }
    return '';
  }
}
