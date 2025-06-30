import { DateHelper } from '@app/helpers';
import { Auditable } from '../auditable';
import { IdValue } from '../idValue';
import { User } from '../user';
import { ProductCategoryDto } from '../product-workflow/product-category-dto';
import { ProjectProduct } from './project-product';

export class ProjectProductCategory extends Auditable {
  id: number;
  caseId: number;
  productCategoryId: number;
  productCategory: ProductCategoryDto; // it may also be of CategoryDto type
  statusId: number;
  status: IdValue;
  products: ProjectProduct[];
  childs: ProjectProductCategory[];
  handoff: Date;
  engagedDate: Date;
  projectScopeStatusId: number;
  projectScopeStatus: IdValue;
  assignedUserId: number;
  assignedUser: User;

  public static toModel(
    item: ProjectProductCategory | any,
  ): ProjectProductCategory {
    if (item) {
      const result = {
        ...super.toModel(item),
        id: item.id,
        caseId: item.caseId,
        productCategoryId: item.productCategoryId || item.categoryDto?.id,
        productCategory: ProductCategoryDto.toModel(item.productCategory || item.categoryDto),
        statusId: item.statusId,
        status: item.status,
        products: item.products.map(product => ProjectProduct.toModel(product)),
        childs: item.childs || [],
        handoff: DateHelper.toLocalDate(item.handoff),
        engagedDate: DateHelper.toLocalDate(item.engagedDate),
        projectScopeStatusId: item.projectScopeStatusId,
        projectScopeStatus: item.projectScopeStatus,
        assignedUserId: item.assignedUserId,
        assignedUser: item.assignedUser,
      };
      return result;
    }

    return null;
  }

  public static toExtendedModel(
    item: ProjectProductCategory | any,
    productsByCategory: ProjectProductCategory[] = [],
    projectProducts: ProjectProduct[] = [],
  ) {
    if (item) {
      const result = {
        ...super.toModel(item),
        id: item.id,
        caseId: item.caseId,
        productCategoryId: item.productCategoryId || item.categoryDto?.id,
        productCategory: ProductCategoryDto.toModel(item.productCategory || item.categoryDto),
        statusId: item.statusId,
        status: item.status,
        products: item.products?.length
          ? item.products
          : this.getProducts(
            item.productCategoryId,
            productsByCategory,
            projectProducts,
          ),
        childs: item.childs || [],
        handoff: DateHelper.toLocalDate(item.handoff),
        engagedDate: DateHelper.toLocalDate(item.engagedDate),
        projectScopeStatusId: item.projectScopeStatusId,
        projectScopeStatus: item.projectScopeStatus,
        assignedUserId: item.assignedUserId,
        assignedUser: item.assignedUser,
      };
      return result;
    }

    return null;
  }

  private static getProducts(productCategoryId: number, productsByCategory: ProjectProductCategory[], projectProducts: ProjectProduct[]) {
    const result = productsByCategory.find(x => x.productCategoryId === productCategoryId)?.products || [];
    projectProducts.forEach(x => {
      const item = result.find(product => x.productId === product.id);
      if (item) {
        item.isChecked = true;
        item.serviceId = x.id;
        item.caseId = x.caseId;
      }
    });

    return result;
  }

  private static getModifiedProducts(products) {
    const modifiedProducts = products.filter(product => {
      if (product.isModified) {
        return true;
      }

      return !!product.conditions.filter(condition => condition.isModified).length;
    });

    return modifiedProducts;
  }

  public static toDto(productCategory: ProjectProductCategory) {
    return {
      id: productCategory.id,
      statusId: productCategory.statusId,
      productCategoryId: productCategory.productCategoryId,
      caseProducts: this.getModifiedProducts(productCategory.products).map(product => ProjectProduct.toDto(product)),
      engagedDate: productCategory.engagedDate,
      handoff: productCategory.handoff,
      projectScopeStatusId: productCategory.projectScopeStatus?.id,
      assignedUserId: productCategory.assignedUser?.id,
    };
  }
}
