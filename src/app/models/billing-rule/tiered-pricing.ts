import isNumber from 'lodash-es/isNumber';
import { PriceType } from '../enums/billing-rule/price-type.enum';

export class TieredPricing {
  lowerValue: number;
  upperValue: number;
  tierPrice: number;
  priceType: PriceType;

  public static toModel(item: TieredPricingDto): TieredPricing {
    if (!item) return null;

    return {
      lowerValue: item.lowerPrice,
      upperValue: item.upperPrice,
      tierPrice: item.tierPrice ?? item.tierPricePct,
      priceType: isNumber(item.tierPricePct) ? PriceType.Percentage : PriceType.Amount,
    };
  }

  public static toDto(item: any): TieredPricingDto {
    if (!item) return null;

    return {
      lowerPrice: item.lowerValue,
      tierPrice: item.priceType === PriceType.Amount ? item.tierPrice : null,
      tierPricePct: item.priceType === PriceType.Percentage ? item.tierPrice : null,
      upperPrice: item.upperValue,
    };
  }
}

export interface TieredPricingDto {
  lowerPrice: number;
  upperPrice: number;
  tierPrice: number;
  tierPricePct: number;
}
