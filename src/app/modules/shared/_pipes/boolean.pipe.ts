import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'booleanPipe' })
export class BooleanPipe implements PipeTransform {
  transform(value: any): boolean | null {
    if (value === undefined || value === null) {
      return null;
    } else {
      switch (value.toString().toLowerCase()) {
        case 'yes':
        case 'true':
        case '1':
          return true;
        case 'no':
        case 'false':
        case '0':
          return false;
        default:
          return null;
      }
    }
  }
}
