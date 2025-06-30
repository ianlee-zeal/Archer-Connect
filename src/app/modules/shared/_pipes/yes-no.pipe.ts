import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'yesNoPipe' })
export class YesNoPipe implements PipeTransform {
  transform(value): string {
    if (value === undefined || value === null) {
      return '';
    } else {
      if (value) {
        return 'Yes';
      } else {
        return 'No';
      }
    }
  }

  transformNull(value): string {
    if (value === undefined || value === null || !value) {
      return 'No';
    } else
    {
      return 'Yes';
    }
  }
}
