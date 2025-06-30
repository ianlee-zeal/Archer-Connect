/* eslint-disable class-methods-use-this */
import { Pipe, PipeTransform } from '@angular/core';

const PHONE_MASKED_LENGTH = 4;
const PHONE_MASK = '***-**-';

@Pipe({ name: 'phone', pure: true })
export class PhoneNumberPipe implements PipeTransform {
  transform(phoneNumber: number | string): any {
    const stringPhone = `${phoneNumber}`;

    // get only digits from input string.
    const phoneDigits = stringPhone.match(/(\d+)/g);
    if (phoneDigits) {
      if (phoneDigits[0].length === PHONE_MASKED_LENGTH) {
        return `${PHONE_MASK}${phoneDigits[0]}`;
      }

      const phoneFromRegex = phoneDigits.reduce((acc: string, val) => acc + val, ''); // concatenate all matches into a single string

      const section1 = phoneFromRegex.slice(0, 3);
      const section2 = phoneFromRegex.slice(3, 6);
      const section3 = phoneFromRegex.slice(6);

      // convert the phone string into the following format: ###-###-####
      const result = `${this.getPhoneSection(section1, true)}${this.getPhoneSection(section2)}${this.getPhoneSection(section3)}`;

      return result;
    }

    return '';
  }

  private getPhoneSection(phoneSection: string, isFirstSection?: boolean): string {
    if (isFirstSection) {
      return phoneSection;
    }
    return phoneSection ? `-${phoneSection}` : '';
  }
}
