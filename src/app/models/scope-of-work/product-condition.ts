import { Auditable } from '../auditable';
import { Product } from '../liens/product';

export class ProductCondition extends Auditable {
  id: number;
  product: Product;
  name: string;
}
