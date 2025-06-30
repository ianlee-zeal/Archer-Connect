import { ProductCategoryDto } from '../product-workflow/product-category-dto';
import { Product } from './product';

export class ProductService {
  productCategory: ProductCategoryDto;
  product: Product;

  public static toModel(item: any): ProductService {
    if (!item) return null;

    return {
      productCategory: ProductCategoryDto.toModel(item.productCategory),
      product: Product.toModel(item.product),
    };
  }
}
