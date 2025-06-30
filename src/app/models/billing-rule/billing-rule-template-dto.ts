import { BillingRuleTemplateRelatedServiceDto } from './billing-rule-template-service';

export interface BillingRuleTemplateDto {
  id: number;
  name: string;
  description: string;
  revRecItemId: number;
  revRecMethodId: number;
  invoicingItemId: number;
  feeScopeId: number;
  statusId: number;
  relatedServices: BillingRuleTemplateRelatedServiceDto[];
}
