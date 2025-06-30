/* eslint-disable no-restricted-globals */
import { PostageCode } from '@app/models/enums/postage-code.enum';

export class UrlHelper {
  public static getBaseUrl(url: string): string {
    let index;
    const urlArray = url.split('/');

    for (let i = 0; i < urlArray.length; i++) {
      if (urlArray[i].length > 0 && !isNaN(+urlArray[i])) {
        index = i;
        break;
      }
    }

    return index == null
      ? url
      : urlArray.slice(0, index + 1).join('/');
  }

  public static getParent(url: string, substring: string): string {
    const indx = url.indexOf(substring);
    const pathArr = url.substring(0, indx).split('/');

    return pathArr[pathArr.length - 1];
  }

  public static getUrlArrayForPager(currentId: number, id: number, routerUrl: string): string[] {
    return routerUrl.replace(currentId.toString(), id.toString()).split('/').filter(i => i !== '');
  }

  static getPostalTrackingUrl(providerCode: string, trackingNumber: string): string {
    let url: string;
    switch (providerCode.toUpperCase()) {
      case PostageCode.FedEx:
        url = `https://www.fedex.com/apps/fedextrack/index.html?tracknumbers=${trackingNumber}`;
        break;
      case PostageCode.USPS:
        url = `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
        break;
      case PostageCode.UPS:
        url = `http://wwwapps.ups.com/WebTracking/processInputRequest?TypeOfInquiryNumber=T&InquiryNumber1=${trackingNumber}`;
        break;
      case PostageCode.DHL:
        url = `https://www.dhl.com/us-en/home/tracking/tracking-ecommerce.html?submit=1&tracking-id=${trackingNumber}`;
        break;
      default:
        throw new Error('Unsupported tracking provider');
    }
    return url;
  }

  /**
   * Gets the id param from the URL segment.
   * By default takes the last readable id from the URL segment.
   *
   * @static
   * @param {string} url - checked url
   * @param {number} [urlSegmentIndex=null] - param index in URL,
   * @return {*}  {number}
   * @memberof UrlHelper
   */
  static getId(url: string, urlSegmentIndex: number = null): number {
    const urlArray = url.split('/');
    for (let i = urlArray.length - 1; i >= 0; i--) {
      const param = +urlArray[i];
      if (!isNaN(param)) {
        if (urlSegmentIndex === null || i === urlSegmentIndex) {
          return param;
        }
      }
    }
    return null;
  }

  static openNewTab(url: string) {
    window.open(url, '_blank');
  }
}
