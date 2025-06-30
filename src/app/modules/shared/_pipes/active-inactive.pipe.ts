import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'activeInactivePipe' })
export class ActiveInactivePipe implements PipeTransform {
  transform(value): string {
    if (value === undefined || value === null) {
      return '';
    }
    if (value) {
      return 'Active';
    }
    return 'Inactive';
  }

  transformNull(value): string {
    if (value === undefined || value === null || !value) {
      return 'Inactive';
    }
    return 'Active';
  }
}
