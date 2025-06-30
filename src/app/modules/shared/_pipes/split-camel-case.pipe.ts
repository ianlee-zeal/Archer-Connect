import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'splitCamelCase', pure: true })
export class SplitCamelCasePipe implements PipeTransform {
  transform(s: string): any {
    if (!s) {
      return '';
    }
    return s.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  }
}