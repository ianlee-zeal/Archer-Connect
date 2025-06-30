import { Pipe, PipeTransform } from "@angular/core";

///

@Pipe({
  name: 'join'
})
export class JoinPipe implements PipeTransform {
  transform(items: any[], separator: string = ', '): string {
    if (!Array.isArray(items) || items.length === 0)
      return '';

    return items.join(separator);
  }
}
