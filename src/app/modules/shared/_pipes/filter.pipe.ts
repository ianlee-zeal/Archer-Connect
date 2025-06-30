import { Pipe, PipeTransform } from "@angular/core";

///

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], fieldName: string, value: any, strict = false): any[] {
    if (items.length === 0 || value == null)
      return items;

    return strict
      ? items.filter(item => item[fieldName] === value)
      : this.unstrictFilter(items, fieldName, value);
  }

  private unstrictFilter(items, fieldName, value) {
    switch (typeof value) {
      case 'boolean':
        return items.filter(item => Boolean(item[fieldName]) === value);
      case 'number':
        return items.filter(item => Number(item[fieldName]) === value);
      case 'string':
        return items.filter(item => String(item[fieldName]).toUpperCase() === value.toUpperCase());
    }

    return items;
  }
}
