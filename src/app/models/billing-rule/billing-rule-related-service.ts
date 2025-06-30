import { ChipListOption } from '../chip-list-option';
import { ProductCategory } from '../enums';
import { Product } from '../liens/product';
import { ProductCategoryDto } from '../product-workflow/product-category-dto';

export class BillingRuleRelatedService {
  id: number;
  billingRuleId: number;
  productCategoryId: ProductCategory;
  productId: number;
  productCategory: ProductCategoryDto;
  product: Product;
  name: string;

  public static toModel(item: BillingRuleRelatedServiceDto): BillingRuleRelatedService {
    if (item) {
      const productCategory = ProductCategoryDto.toModel(item.productCategory);
      const product = Product.toModel(item.product);

      return {
        id: item.id,
        billingRuleId: item.billingRuleId,
        productCategoryId: item.productCategoryId,
        productId: item.productId,
        productCategory,
        product,
        name: (productCategory ? productCategory.name : '') + (product ? ` (${product.name})` : ''),
      };
    }

    return null;
  }

  public static fromChipListOptionToDto(item: ChipListOption): BillingRuleRelatedServiceDto {
    if (!item) return null;

    const [productCategoryId, productId] = item.id.split('-');

    return <BillingRuleRelatedServiceDto>{
      productId: +productId,
      productCategoryId: +productCategoryId,
    };
  }
}

export interface BillingRuleRelatedServiceDto {
  id: number;
  billingRuleId: number;
  productCategoryId: number;
  productCategory: any;
  productId: number;
  product: any;
}
