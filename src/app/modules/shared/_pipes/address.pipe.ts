import { Pipe, PipeTransform } from '@angular/core';
import { CommonHelper } from '@app/helpers/common.helper';
import { Address } from '@app/models/address/address';

/**
 * Transforms Address object to the following string:
 *
 *  line1
 *  line2
 *  City, State Zip
 *
 * @export
 * @class AddressPipe
 * @implements {PipeTransform}
 */
@Pipe({ name: 'address', pure: true })
export class AddressPipe implements PipeTransform {
  transform(addr: Address | undefined, separator = '\r\n'): string {
    if (!addr) {
      return '';
    }

    const result = [];
    this.appendLineTo(result, addr.line1);
    this.appendLineTo(result, addr.line2);

    const lastLine = [];
    this.appendLineTo(lastLine, addr.city);

    const hasState = !CommonHelper.isBlank(addr.state);
    const hasZip = !CommonHelper.isBlank(addr.zip);
    this.appendLineTo(lastLine, `${hasState ? addr.state : ''}${hasState && hasZip ? ' ' : ''}${hasZip ? addr.zip : ''}`);

    this.appendLineTo(result, lastLine.join(', '));

    return result.join(separator);
  }

  private appendLineTo(values: string[], value: string): void {
    if (!CommonHelper.isBlank(value)) {
      values.push(value);
    }
  }
}
