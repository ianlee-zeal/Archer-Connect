import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'fractionalABA', pure: true })
export class FractionalABAPipe implements PipeTransform {
  transform(stringNumber: string): any {

    if (stringNumber) {

      const section1 = stringNumber.slice(0, 2);
      const section2 = stringNumber.slice(2, 6);
      const section3 = stringNumber.slice(6);

      const result = section1 + '-' + section2 + '/' + section3;

      return result;
    }

    return '';
  }
}