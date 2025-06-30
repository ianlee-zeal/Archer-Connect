import isNumber from 'lodash-es/isNumber';
import { PriceType } from '../enums/billing-rule/price-type.enum';
import { IdValue } from '../idValue';
import { OutcomeBasedPricingDetails, OutcomeBasedPricingDetailsDto } from './outcome-based-pricing-details';

export class OutcomeBasedPricing {
  id: number;
  scenario: IdValue;
  variablePricingApplies: boolean;
  variablePricingType: IdValue;
  details: OutcomeBasedPricingDetails;
  price: number;
  priceType: PriceType;

  public static toModel(item: OutcomeBasedPricingDto): OutcomeBasedPricing {
    if (!item) return null;

    return {
      id: item.id,
      scenario: item.outcomeBasedScenarioType,
      variablePricingApplies: item.variablePricing,
      variablePricingType: item.variablePricingType,
      details: OutcomeBasedPricingDetails.toModel(item.details),
      price: item.price ?? item.pricePct,
      priceType: isNumber(item.pricePct) ? PriceType.Percentage : PriceType.Amount,
    };
  }

  public static toDto(item: any): OutcomeBasedPricingDto {
    if (!item) return null;

    return {
      id: item.id > 0 ? item.id : 0,
      scenario: item.scenario,
      billingRuleId: item.billingRuleId,
      billingRuleTemplateId: item.billingRuleTemplateId,
      variablePricing: item.variablePricingApplies,
      variablePricingType: null,
      variablePricingTypeId: item.variablePricingType?.id,
      details: OutcomeBasedPricingDetails.toDto(item.details),
      price: item.priceType === PriceType.Amount ? item.price : null,
      pricePct: item.priceType === PriceType.Percentage ? item.price : null,
      outcomeBasedScenarioType: null,
      outcomeBasedScenarioTypeId: item.scenario?.id,
    };
  }
}

export interface OutcomeBasedPricingDto {
  id: number;
  scenario: IdValue;
  billingRuleId: number;
  billingRuleTemplateId: number;
  variablePricing: boolean;
  variablePricingType: IdValue;
  variablePricingTypeId: number;
  details: OutcomeBasedPricingDetailsDto;
  price: number;
  pricePct: number;
  outcomeBasedScenarioTypeId: number;
  outcomeBasedScenarioType: IdValue;
}
