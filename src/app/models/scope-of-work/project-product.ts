import { Auditable } from '../auditable';
import { Product } from '../liens/product';
import { Project } from '../projects/project';
import { ProjectProductCondition } from './project-product-condition';

export class ProjectProduct extends Auditable {
  id: number;
  caseId: number;
  case: Project;
  productId: number;
  product: Product;

  productCategoryId: number;
  name: string;
  shortName: string;
  description: string;
  isActive: boolean;

  conditions: ProjectProductCondition[];

  isChecked: boolean;
  isModified: boolean;
  serviceId: number;

  public static toModel(item: ProjectProduct): ProjectProduct {
    if (item) {
      var result = {
        ...super.toModel(item),
        description: item.description,
        id: item.id,
        isActive: item.isActive,
        name: item.name,
        productCategoryId: item.productCategoryId,
        shortName: item.shortName,

        conditions: item.conditions,

        isChecked: item.isChecked,
        isModified: item.isModified,

        serviceId: item.serviceId
      } as ProjectProduct;
      return result;
    }

    return null;
  }

  public static toDto(product: ProjectProduct) {
    return {
      id: product.serviceId || 0,
      isChecked: product.isChecked,
      productId: product.id,
      caseProductConditions: this.getModifiedCondition(product.conditions).map(condition => ProjectProductCondition.toDto(condition))
    };
  }

  private static getModifiedCondition(conditions) {
    return conditions.filter(condtion => condtion.isModified);
  }
}
