import { BillingRuleTemplateRelatedService } from '@app/models/billing-rule/billing-rule-template-service';
import { ProductService } from '@app/models/liens/product-service';
import { KeyValuePair } from '@app/models/utils';
import { SelectOption } from '../modules/shared/_abstractions/base-select';

const defaultIdGetter = (item: any) => item.id;
const defaultNameGetter = (item: any) => item.name;

export class SelectHelper {
  public static toOptions<T>(
    items: T[],
    idGetter: (item: T) => number | string = defaultIdGetter,
    nameGetter: (item: T) => string = defaultNameGetter,
  ): SelectOption[] {
    if (!items) {
      return [];
    }

    return items.map(item => ({
      id: idGetter(item),
      name: nameGetter(item),
    }));
  }

  public static enumToOptions<T>(
    items: T,
    idGetter: (item) => number | string = defaultIdGetter,
    nameGetter: (item) => string = defaultNameGetter,
  ): SelectOption[] {
    const rawOptions = Object.keys(items).filter(e => !Number.isNaN(+e)).map(i => ({ id: +i, name: items[i] }));
    const transformedOptions = rawOptions.map(item => ({
      id: idGetter(item),
      name: nameGetter(item),
    }));

    return transformedOptions;
  }

  public static serviceToKeyValuePair(service: ProductService | BillingRuleTemplateRelatedService): KeyValuePair<string, string> {
    const val = {
      key: `${service.productCategory.id}`,
      value: `${service.productCategory.name}`,
    };

    if (service.product) {
      val.key += `-${service.product?.id}`;
      val.value += ` (${service.product.name})`;
    }

    return val;
  }

  public static toKeyValuePair(data: any): KeyValuePair<number, string> {
    const val = {
      key: data?.id,
      value: `${data?.name}`,
    };

    return val;
  }

  public static toGroupedOption(data: any, group: string): SelectOption {
    const val = {
      id: data?.id,
      name: data?.name,
      group,
    };

    return val;
  }

  public static areOptionsEqual(options1: SelectOption[], options2: SelectOption[]): boolean {
    if (!options1 || !options2) {
      return false;
    }

    if (options1.length !== options2.length) {
      return false;
    }

    for (let i = 0; i < options1.length; i++) {
      if (options1[i].name !== options2[i].name) {
        return false;
      }
    }

    return true;
  }
}
