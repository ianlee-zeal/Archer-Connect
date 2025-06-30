import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CurrencyHelper } from '@app/helpers/currency.helper';

/*
 * Same as currency pipe but additionally accepts fallback value.
 * The fallback is displayed when the value is null or undefined.
 * Example:
 *   {{ null | extendedCurrency:'some fallback value' }}
 *   {{ undefined | extendedCurrency:'some fallback value' }}
 *   formats to: 'some fallback value'
*/
@Pipe({ name: 'extendedCurrency' })
export class ExtendedCurrencyPipe extends CurrencyPipe implements PipeTransform {
  transform(
    value: number | null | undefined,
    fallbackValue?: string,
    currencyCode?: string,
    display?: string | boolean,
    digitsInfo?: string,
    locale?: string,
  ): any {
    if (value === null || value === undefined) {
      return fallbackValue ?? '';
    }

    const amount = CurrencyHelper.round(value);

    return super.transform(amount, currencyCode, display, digitsInfo, locale);
  }
}
