import { ProductCategory } from '../enums';
import { Product } from '../liens/product';
import { ProductCategoryDto } from '../product-workflow/product-category-dto';

export class BillingRuleTemplateRelatedService {
  id: number;
  billingRuleTemplateId: number;
  productCategoryId: ProductCategory;
  productId: number;
  productCategory: ProductCategoryDto;
  product: Product;
  name: string;

  public static toModel(item: any): BillingRuleTemplateRelatedService {
    if (item) {
      const productCategory = ProductCategoryDto.toModel(item.productCategory);
      const product = Product.toModel(item.product);

      return {
        id: item.id,
        billingRuleTemplateId: item.billingRuleTemplateId,
        productCategoryId: item.productCategoryId,
        productId: item.productId,
        productCategory,
        product,
        name: productCategory.name + (product ? ` (${product.name})` : ''),
      };
    }

    return null;
  }
}

export interface BillingRuleTemplateRelatedServiceDto {
  billingRuleTemplateId: number;
  productCategoryId: ProductCategory;
  productId: number;
}
