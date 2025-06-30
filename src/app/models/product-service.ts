import { Product } from './liens/product';
import { ProductCategoryDto } from './product-workflow/product-category-dto';

export interface ProductService {
  product: Product;
  productCategory: ProductCategoryDto;
}
