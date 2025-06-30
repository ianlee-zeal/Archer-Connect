import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'federalWireABA', pure: true })
export class FederalWireABAPipe implements PipeTransform {
  transform(stringNumber: string): any {
    if (stringNumber) {
      const section1 = stringNumber.slice(0, 4);
      const section2 = stringNumber.slice(4, 8);
      const section3 = stringNumber.slice(8);

      const result = `${section1}-${section2}-${section3}`;

      return result;
    }

    return '';
  }
}
