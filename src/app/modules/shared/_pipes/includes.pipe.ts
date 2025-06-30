import { Pipe, PipeTransform } from '@angular/core';

/**
 * <ng-container *ngIf="options | includes : 'name' : filterValue as options">
 * ...
 * </ng-container
 */

@Pipe({
  name: 'includes'
})
export class IncludesPipe implements PipeTransform {
  transform(items: any[], field: string, value: string): any[] {
    if (!items) return [];
    if (!value) return items;

    return items.filter(item => {
      return item[field].toLowerCase().includes(value.toLowerCase());
    });
  }
}
