import isNumber from 'lodash-es/isNumber';
import { Org, User } from '..';
import { PriceType } from '../enums/billing-rule/price-type.enum';
import { BillingRuleTriggerTiming } from '../enums/billing-rule/timing.enum';
import { IdValue } from '../idValue';
import { BillingRuleRelatedService, BillingRuleRelatedServiceDto } from './billing-rule-related-service';
import { BillingRuleTemplate } from './billing-rule-template';
import { BillingRulesToFeeCapsDto } from './billing-rule-to-fee-caps-dto';
import { BillingTrigger, BillingTriggerDto } from './billing-trigger';
import { FeeSplit, FeeSplitDto } from './fee-split';
import { OutcomeBasedPricing, OutcomeBasedPricingDto } from './outcome-based-pricing';
import { OutcomeBasedPricingDetails, OutcomeBasedPricingDetailsDto } from './outcome-based-pricing-details';
import { DateHelper } from '@app/helpers';

export class BillingRule {
  id: number;
  name: string;
  template: BillingRuleTemplate;
  relatedServices: BillingRuleRelatedService[];
  feeScope: IdValue;
  chartOfAccount: IdValue;
  revRecMethod: IdValue;
  iliAutoGeneration: boolean;
  caseId: number;
  feeSplit: boolean;
  org: IdValue;
  pricingTerms: string;
  invoicingTerms: string;
  paymentTerms: string;
  revRecTerms: string;
  minFee: number;
  minFeeType: PriceType;
  maxFee: number;
  maxFeeType: PriceType;
  isOutcomeBased: boolean;
  isVariable: boolean;
  details: OutcomeBasedPricingDetails;
  price: number;
  priceType: PriceType;
  variablePricingType: IdValue;
  billingTriggers: BillingTrigger[];
  pricingTriggers: BillingTrigger[];
  feeSplits: FeeSplit[];
  outcomeBasedPricings: OutcomeBasedPricing[];
  status: IdValue;
  isRelatedServiceRequired: boolean;
  collectorOrg: Org;
  revRecItem: IdValue;
  invoicingItem: IdValue;
  billTo: IdValue;
  variablePricingTypeId: number;
  billingRulesToFeeCaps: BillingRulesToFeeCapsDto[];
  feeCapsIds: number[];
  hasBillingRulesToFeeCaps: boolean;
  createdBy: User;
  createdDate: Date;
  lastModifiedBy: User;
  lastModifiedDate: Date;

  public static toModel(item: BillingRuleResponse): BillingRule {
    if (!item) return null;

    const br: BillingRule = {
      id: item.id,
      name: item.name,
      template: BillingRuleTemplate.toModel(item.billingRuleTemplate),
      feeScope: item.feeScope,
      revRecMethod: item.revRecMethod,
      relatedServices: item.relatedServices?.map(BillingRuleRelatedService.toModel) ?? [],
      iliAutoGeneration: item.iliAutoGeneration,
      caseId: item.caseId,
      chartOfAccount: item.chartOfAccount,
      feeSplit: item.feeSplit,
      org: item.org,
      pricingTerms: item.pricingTerms,
      paymentTerms: item.paymentTerms,
      revRecTerms: item.revRecTerms,
      invoicingTerms: item.invoicingTerms,
      minFee: item.minFee ?? item.minFeePct,
      maxFee: item.maxFee ?? item.maxFeePct,
      minFeeType: isNumber(item.minFeePct) ? PriceType.Percentage : PriceType.Amount,
      maxFeeType: isNumber(item.maxFeePct) ? PriceType.Percentage : PriceType.Amount,
      isOutcomeBased: item.isOutcomeBased,
      isVariable: item.isVariable,
      details: OutcomeBasedPricingDetails.toModel(item.details),
      price: item.price ?? item.pricePct,
      priceType: isNumber(item.pricePct) ? PriceType.Percentage : PriceType.Amount,
      variablePricingType: item.variablePricingType,
      billingTriggers: [],
      pricingTriggers: [],
      feeSplits: item.feeSplits?.map(FeeSplit.toModel) ?? [],
      outcomeBasedPricings: item.outcomeBasedScenarios?.map(OutcomeBasedPricing.toModel) ?? [],
      status: item.status,
      isRelatedServiceRequired: item.relatedServiceRequired,
      collectorOrg: Org.toModel(item.collectorOrg),
      invoicingItem: item.invoicingItem,
      revRecItem: item.revRecItem,
      billTo: item.billTo,
      variablePricingTypeId: item.variablePricingTypeId,
      billingRulesToFeeCaps: item.billingRulesToFeeCaps || [],
      feeCapsIds: item.billingRulesToFeeCaps?.map(b => b.feeCapId) || [],
      hasBillingRulesToFeeCaps: !!item.billingRulesToFeeCaps && item.billingRulesToFeeCaps.length > 0,

      createdBy: (item.createdBy && User.toModel(item.createdBy)) || null,
      createdDate: DateHelper.toLocalDate(item.createdDate),
      lastModifiedBy: (item.lastModifiedBy && User.toModel(item.lastModifiedBy)) || null,
      lastModifiedDate: DateHelper.toLocalDate(item.lastModifiedDate),
    };

    for (const t of item.billingTriggers ?? []) {
      if (t.timing === BillingRuleTriggerTiming.Billing) {
        br.billingTriggers.push(BillingTrigger.toModel(t));
      } else if (t.timing === BillingRuleTriggerTiming.Pricing) {
        br.pricingTriggers.push(BillingTrigger.toModel(t));
      }
    }

    return br;
  }
}

export interface BillingRuleDto {
  id: number;
  name: string;
  billingRuleTemplateId: number;
  billingRuleTemplate: any;
  feeScope: IdValue;
  chartOfAccountId: number;
  chartOfAccount: IdValue;
  revRecMethod: IdValue;
  caseId: number;
  feeScopeId: number;
  iliAutoGeneration: boolean;
  revRecMethodId: number;
  feeSplit: boolean;
  orgId: number;
  org: IdValue;
  pricingTerms: string;
  invoicingTerms: string;
  paymentTerms: string;
  revRecTerms: string;
  minFee: number;
  minFeePct: number;
  maxFee: number;
  maxFeePct: number;
  isOutcomeBased: boolean;
  isVariable: boolean;
  details: OutcomeBasedPricingDetailsDto;
  price: number;
  pricePct: number;
  variablePricingTypeId: number;
  variablePricingType: IdValue;
  relatedServices: BillingRuleRelatedServiceDto[];
  billingTriggers: BillingTriggerDto[];
  feeSplits: FeeSplitDto[];
  outcomeBasedScenarios: OutcomeBasedPricingDto[];
  status: IdValue;
  statusId: number;
  relatedServiceRequired: boolean;
  collectorOrg: Org;
  collectorOrgId: number;
  invoicingItem: IdValue;
  revRecItem: IdValue;
  invoicingItemId: number;
  revRecItemId: number;
  billTo: IdValue;
  billToId: number;
  billingRulesToFeeCaps: BillingRulesToFeeCapsDto[];
}

export interface BillingRuleResponse extends BillingRuleDto {
  createdBy: User;
  createdDate: string;
  lastModifiedBy?: User;
  lastModifiedDate: string;
}
