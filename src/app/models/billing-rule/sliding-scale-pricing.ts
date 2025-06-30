import isNumber from 'lodash-es/isNumber';
import { PriceType } from '../enums/billing-rule/price-type.enum';
import { InjuryCategory } from '../';

export class SlidingScalePricing {
  lowerValue: number;
  upperValue: number;
  tierPrice: number;
  priceType: PriceType;
  injuryCategories: InjuryCategory[];

  public static toModel(item: SlidingScalePricingDto): SlidingScalePricing {
    if (!item) return null;

    return {
      lowerValue: item.lowerPrice,
      upperValue: item.upperPrice,
      tierPrice: item.tierPrice ?? item.tierPricePct,
      priceType: isNumber(item.tierPricePct) ? PriceType.Percentage : PriceType.Amount,
      injuryCategories: item.injuryCategories ?? [],
    };
  }

  public static toDto(item: any): SlidingScalePricingDto {
    if (!item) return null;

    return {
      lowerPrice: item.lowerValue,
      injuryCategories: item.injuryCategories,
      tierPrice: item.priceType === PriceType.Amount ? item.tierPrice : null,
      tierPricePct: item.priceType === PriceType.Percentage ? item.tierPrice : null,
      upperPrice: item.upperValue,
    };
  }
}

export interface SlidingScalePricingDto {
  lowerPrice: number;
  upperPrice: number;
  tierPrice: number;
  tierPricePct: number;
  injuryCategories: InjuryCategory[];
}
