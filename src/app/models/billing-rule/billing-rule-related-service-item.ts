import { ChipListOption } from '../chip-list-option';
import { ProductCategoryEnum } from '../enums/billing-rule/product-category.enum';
import { BillingRuleRelatedService } from './billing-rule-related-service';
import { BillingRuleTemplateRelatedService } from './billing-rule-template-service';

export class BillingRuleRelatedServiceGridItem {
  id: string;
  serviceName: string;
  productName: string;

  public static convertToItems(services: BillingRuleTemplateRelatedService[] | BillingRuleRelatedService[]): BillingRuleRelatedServiceGridItem[] {
    return services.map(s => {
      let id = `${s.productCategory.id}`;
      if (s.product) {
        id += `-${s.product?.id}`;
      }

      return {
        id,
        serviceName: s.productCategory.name,
        productName: s.product?.name || null,
      };
    });
  }

  public static chipListToItems(chipList: ChipListOption[]): BillingRuleRelatedServiceGridItem[] {
    if (chipList.some(service => service.name === ProductCategoryEnum[ProductCategoryEnum.All])) {
      return chipList.map(service => ({ id: service.id, serviceName: service.name, productName: '' }));
    }

    const parenthesesContentRegExp = /\(([^)]+)\)/gi;
    return chipList.map(service => {
      if (service.id.indexOf('-') !== -1) {
        let match: any;
        let productName: string;
        let serviceName: string;

        do {
          match = parenthesesContentRegExp.exec(service.name);
          if (match) {
            productName = match[1];
            serviceName = service.name.slice(0, match.index).trim();
          }
        } while (match != null);

        return ({ id: service.id, serviceName, productName });
      }

      return ({ id: service.id, serviceName: service.name, productName: '' });
    });
  }
}
