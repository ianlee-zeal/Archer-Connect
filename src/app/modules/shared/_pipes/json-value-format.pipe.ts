import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

import { DateFormatPipe } from './date-format.pipe';
import { DataType } from '@app/models/enums/data-type.enum';

@Pipe({
  name: 'jsonValueFormat',
})
export class JsonValueFormatPipe implements PipeTransform {
  constructor(
    private dateFormatPipe: DateFormatPipe,
    private currencyPipe: CurrencyPipe,
  ) {
  }

  public transform(value: string, type: DataType): string {
    if (!value) {
      return value;
    }

    switch (type) {
      case DataType.Date:
        return this.dateFormatPipe.transform(value);
      case DataType.Money:
        return this.currencyPipe.transform(value);
      default:
        return value;
    }
  }
}
