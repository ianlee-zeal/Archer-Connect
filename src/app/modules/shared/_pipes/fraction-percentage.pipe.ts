import { PipeTransform, Pipe } from '@angular/core';
import { PercentageHelper } from '@app/helpers';

@Pipe({ name: 'fractionPercentage' })
export class FractionPercentagePipe implements PipeTransform {
  private readonly DEFAULT_FRACTION_DIGITS = 8;

  transform(value: number, percentFractionDigits: number = this.DEFAULT_FRACTION_DIGITS): string {
    return PercentageHelper.toFractionPercentage(value, percentFractionDigits);
  }
}
