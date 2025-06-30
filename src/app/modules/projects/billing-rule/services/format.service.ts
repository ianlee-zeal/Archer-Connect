import { CurrencyPipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { CommonHelper } from '@app/helpers';
import { InjuryCategoryTitlePipe } from '@app/modules/shared/_pipes';
import { FeeSplit, InjuryCategory } from '@app/models/billing-rule';
import { PriceType } from '@app/models/enums/billing-rule/price-type.enum';

@Injectable()
export class FormatService {
  constructor(
    private currency: CurrencyPipe,
    private injuryCategoryTitlePipe: InjuryCategoryTitlePipe) {}

  public toPriceRange(lower: number, upper: number): string {
    if (CommonHelper.isNullOrUndefined(lower) || CommonHelper.isNullOrUndefined(upper)) {
      return '';
    }

    return `${this.currency.transform(lower)}-${this.currency.transform(upper)}`;
  }

  public toPrice(val: number, type: PriceType): string {
    if (CommonHelper.isNullOrUndefined(val)) {
      return '';
    }

    return type === PriceType.Amount ? this.currency.transform(val) : `${val} %`;
  }

  public toFeeSplit(feeSplit: FeeSplit): string {
    return `${feeSplit.org?.name} - ${feeSplit.feePercentage} %`;
  }

  public toInjuryCategoryTitles(categories: InjuryCategory[]) {
    return categories.map(category => this.injuryCategoryTitlePipe.transform(category));
  }
}
