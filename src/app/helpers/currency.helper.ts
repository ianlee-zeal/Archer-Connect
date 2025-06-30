import { formatCurrency } from '@angular/common';
import { isNil } from 'lodash-es';
import { CommonHelper } from './common.helper';
import { StringHelper } from './string.helper';

export class CurrencyHelper {
  public static toUsdFormat({ value }, useDashAsAnEmptyValue = false): string {
    if (useDashAsAnEmptyValue && CommonHelper.isNullOrUndefined(value)) {
      return '-';
    }
    return formatCurrency(value, 'en-US', '$');
  }

  public static toUsdIfNumber({ value }): any {
    if (StringHelper.isNumericString(value)) return this.toUsdFormat({ value });
    return value;
  }

  public static round(value: number): number {
    const neat = +(Math.abs(value).toPrecision(15));
    const rounded = Math.round(neat * 100) / 100;

    return rounded * Math.sign(value);
  }

  private static moneyFormatter(data: any): string {
    return !isNil(data?.value) ? CurrencyHelper.toUsdFormat(data) : '';
  }

  public static renderAmount(data: any): string {
    if (isNil(data?.value)) {
      return '';
    }
    return data.value < 0 ? `(${formatCurrency(Math.abs(data.value), 'en-US', '$')})` : `${this.moneyFormatter(data)}`;
  }

  public static renderAmountAsExcel(data: any): string {
    if (isNil(data?.value)) {
      return '';
    }
    if (data.value == 0) {
      return '$   -';
    }
    return data.value < 0 ? `(${formatCurrency(Math.abs(data.value), 'en-US', '$')})` : `${this.moneyFormatter(data)}`;
  }
}
