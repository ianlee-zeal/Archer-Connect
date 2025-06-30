export class ProductCategoryDto {
  id: number;
  parentId: number | null;
  name: string;
  description: string;
  shortName: string;
  isActive: boolean | null;

  public static toModel(item: any): ProductCategoryDto {
    if (!item) {
      return null;
    }

    return {
      id: item.id,
      parentId: item.parentId,
      name: item.name,
      description: item.description,
      shortName: item.shortName,
      isActive: item.isActive,
    };
  }
}
