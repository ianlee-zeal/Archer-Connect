import { Pipe, PipeTransform } from "@angular/core";

///

@Pipe({
  name: 'map'
})
export class MapPipe implements PipeTransform {
  transform(items: any[], fieldName: string): any[] {
    if (!Array.isArray(items) || items.length === 0) return [];
    if (!fieldName)
      return items;

    return items.map(item => item[fieldName]);
  }
}
