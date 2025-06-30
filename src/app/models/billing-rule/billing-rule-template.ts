import { IdValue } from '../idValue';
import { BillingRuleTemplateRelatedService } from './billing-rule-template-service';
import { BillingTrigger } from './billing-trigger';
import { OutcomeBasedPricingDetails } from './outcome-based-pricing-details';
import { OutcomeBasedPricing } from './outcome-based-pricing';
import { User } from '../user';
import { DateHelper } from '@app/helpers';

export class BillingRuleTemplate {
  id: number;
  name: string;
  description: string;
  status: IdValue;
  invoicingItem: IdValue;
  feeScope: IdValue;
  chartOfAccount: IdValue;
  revRecItem: IdValue;
  revRecMethod: IdValue;
  referenceCount: number;
  relatedServices: BillingRuleTemplateRelatedService[];
  outcomeBasedScenarios: OutcomeBasedPricing[];
  collectorOrgId: number;
  collectorOrg: IdValue;
  maxFee: number;
  maxFeePct: number;
  minFee: number;
  minFeePct: number;
  price: number;
  pricePct: number;
  isOutcomeBased: boolean;
  isVariable: boolean;
  variablePricingType: IdValue;
  variablePricingTypeId: number;
  details: OutcomeBasedPricingDetails;
  isPinned: boolean;
  relatedServiceRequired: boolean;
  iliAutoGeneration: boolean;
  billingTriggers: BillingTrigger[];
  pricingTriggers: BillingTrigger[];
  createdBy: User;
  createdDate: Date;
  lastModifiedBy: User;
  lastModifiedDate: Date;

  public static toModel(item: any): BillingRuleTemplate {
    if (item) {
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        status: item.status,
        invoicingItem: item.invoicingItem,
        feeScope: item.feeScope,
        chartOfAccount: item.chartOfAccount,
        revRecItem: item.revRecItem,
        revRecMethod: item.revRecMethod,
        referenceCount: item.referenceCount,
        collectorOrgId: item.collectorOrgId,
        collectorOrg: item.collectorOrg,
        relatedServices: item.relatedServices?.map(BillingRuleTemplateRelatedService.toModel) ?? [],
        outcomeBasedScenarios: item.outcomeBasedScenarios?.map(OutcomeBasedPricing.toModel) ?? [],
        maxFee: item.maxFee,
        maxFeePct: item.maxFeePct,
        minFee: item.minFee,
        minFeePct: item.minFeePct,
        price: item.price,
        pricePct: item.pricePct,
        isOutcomeBased: item.isOutcomeBased || false,
        isVariable: item.isVariable || false,
        variablePricingType: item.variablePricingType,
        variablePricingTypeId: item.variablePricingTypeId,
        details: OutcomeBasedPricingDetails.toModel(item.details),
        isPinned: item.isPinned,
        relatedServiceRequired: item.relatedServiceRequired,
        iliAutoGeneration: item.iliAutoGeneration,
        billingTriggers: item.billingTriggers,
        pricingTriggers: item.pricingTriggers,
        createdBy: (item.createdBy && User.toModel(item.createdBy)) || null,
        createdDate: DateHelper.toLocalDate(item.createdDate),
        lastModifiedBy: (item.lastModifiedBy && User.toModel(item.lastModifiedBy)) || null,
        lastModifiedDate: DateHelper.toLocalDate(item.lastModifiedDate),
      };
    }

    return null;
  }
}
