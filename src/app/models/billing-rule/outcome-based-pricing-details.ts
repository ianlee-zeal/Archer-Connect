import isNumber from 'lodash-es/isNumber';
import { PriceType } from '../enums/billing-rule/price-type.enum';
import { PercentageOfSavingsPricing, PercentageOfSavingsPricingDto } from './percentage-of-savings-pricing';
import { SlidingScalePricing, SlidingScalePricingDto } from './sliding-scale-pricing';
import { TieredPricing, TieredPricingDto } from './tiered-pricing';

export class OutcomeBasedPricingDetails {
  tieredPricings: TieredPricing[];
  slidingScalePricings: SlidingScalePricing[];
  percentageOfSavingsPricings: PercentageOfSavingsPricing[];
  defaultPrice: number;
  defaultPriceType: PriceType;

  public static toModel(item: OutcomeBasedPricingDetailsDto): OutcomeBasedPricingDetails {
    if (!item) return null;

    return {
      defaultPrice: item.defaultPrice ?? item.defaultPricePct,
      defaultPriceType: isNumber(item.defaultPricePct) ? PriceType.Percentage : PriceType.Amount,
      tieredPricings: item.tierPricing?.items?.map(TieredPricing.toModel) ?? [],
      slidingScalePricings: item.slidingScale?.items?.map(SlidingScalePricing.toModel) ?? [],
      percentageOfSavingsPricings: item.percentageOfSavings?.items?.map(PercentageOfSavingsPricing.toModel) ?? [],
    };
  }

  public static toDto(item: any): OutcomeBasedPricingDetailsDto {
    if (!item) return null;

    return {
      defaultPrice: item.defaultPriceType === PriceType.Amount ? item.defaultPrice : null,
      defaultPricePct: item.defaultPriceType === PriceType.Percentage ? item.defaultPrice : null,
      tierPricing: { items: item.tieredPricings?.map(TieredPricing.toDto) },
      slidingScale: { items: item.slidingScalePricings?.map(SlidingScalePricing.toDto) },
      percentageOfSavings: { items: item.percentageOfSavingsPricings?.map(PercentageOfSavingsPricing.toDto) },
    };
  }
}

export interface OutcomeBasedPricingDetailsDto {
  tierPricing: { items: TieredPricingDto[] };
  slidingScale: { items: SlidingScalePricingDto[] };
  percentageOfSavings: { items: PercentageOfSavingsPricingDto[] };
  defaultPrice: number;
  defaultPricePct: number;
}
