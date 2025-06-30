import { HttpParameterCodec } from '@angular/common/http';

export class CustomUrlEncoder implements HttpParameterCodec {
  // eslint-disable-next-line class-methods-use-this
  public encodeKey(key: string): string {
    return encodeURIComponent(key);
  }

  // eslint-disable-next-line class-methods-use-this
  public encodeValue(value: string): string {
    return encodeURIComponent(value);
  }

  // eslint-disable-next-line class-methods-use-this
  public decodeKey(key: string): string {
    return decodeURIComponent(key);
  }

  // eslint-disable-next-line class-methods-use-this
  public decodeValue(value: string): string {
    return decodeURIComponent(value);
  }
}
