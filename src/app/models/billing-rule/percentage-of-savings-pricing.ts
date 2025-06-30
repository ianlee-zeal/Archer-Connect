export class PercentageOfSavingsPricing {
  percentageOfSavings: number;

  public static toModel(item: PercentageOfSavingsPricingDto): PercentageOfSavingsPricing {
    if (!item) return null;

    return { percentageOfSavings: item.percentage };
  }

  public static toDto(item: any): PercentageOfSavingsPricingDto {
    if (!item) return null;

    return { percentage: item.percentageOfSavings };
  }
}

export interface PercentageOfSavingsPricingDto {
  percentage: number;
}
