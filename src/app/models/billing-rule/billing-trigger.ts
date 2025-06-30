import { BillingRuleTriggerTiming } from '../enums/billing-rule/timing.enum';
import { IdValue } from '../idValue';

export class BillingTrigger {
  id: number;
  billingRuleId: number;
  timing: BillingRuleTriggerTiming;
  additionalData: string;
  triggerTypeId: number;
  triggerType: IdValue;

  public static toModel(dto: BillingTriggerDto): BillingTrigger {
    if (!dto) return null;

    return {
      billingRuleId: dto.billingRuleId,
      id: dto.id,
      timing: dto.timing,
      additionalData: dto.additionalData,
      triggerType: dto.triggerType,
      triggerTypeId: dto.triggerTypeId,
    };
  }
}

export interface BillingTriggerDto {
  id: number;
  billingRuleId: number;
  timing: BillingRuleTriggerTiming;
  additionalData: string;
  triggerTypeId: number;
  triggerType: IdValue;
}
