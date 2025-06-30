import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatLargeNumber' })
export class FormatLargeNumberPipe implements PipeTransform {

  transform(value: number): string {
    if (value < 1000) {
      return value.toString();
    }
    else if (value < 1000000) {
      const roundedValue = Math.round(value / 100) / 10;
      return `${roundedValue}k`;
    }
    else {
      const roundedValue = Math.round(value / 100000) / 10;
      return `${roundedValue}M`;
    }
  }

}
