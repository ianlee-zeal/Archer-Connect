import { BillingRuleTemplateRelatedService } from './billing-rule/billing-rule-template-service';
import { BillingTrigger } from './billing-rule/billing-trigger';
import { ProductService } from './liens/product-service';

export class ChipListOption {
  id: string;
  name: string;
  isRemovable: boolean;

  public static serviceToModel(service: ProductService | BillingRuleTemplateRelatedService): ChipListOption {
    const model: ChipListOption = {
      id: `${service.productCategory.id}`,
      name: `${service.productCategory.name}`,
      isRemovable: true,
    };

    if (service.product) {
      model.id += `-${service.product?.id}`;
      model.name += ` (${service.product.name})`;
    }

    return model;
  }

  public static billingTriggerToModel(trigger: BillingTrigger): ChipListOption {
    return {
      id: `${trigger.triggerType.id}`,
      name: `${trigger.triggerType.name}`,
      isRemovable: true,
    };
  }
}
