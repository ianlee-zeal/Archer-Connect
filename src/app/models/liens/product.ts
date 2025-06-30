export class Product {
  id: number;
  productCategoryId: number;
  name: string;
  shortName: string;
  description: string;
  isActive: boolean;

  public static toModel(item: any): Product {
    if (!item) return null;

    return {
      id: item.id,
      productCategoryId: item.productCategoryId,
      name: item.name,
      shortName: item.shortName,
      description: item.description,
      isActive: item.isActive,
    };
  }

  public static toDto(item: Product): any {
    if (!item) return null;

    return {
      id: item.id,
      productCategoryId: item.productCategoryId,
      name: item.name,
      shortName: item.shortName,
      description: item.description,
      isActive: item.isActive,
    };
  }
}
