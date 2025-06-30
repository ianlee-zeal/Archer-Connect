import { DocumentType } from '@app/models/documents/document-type';

export class EntityDocumentType extends DocumentType {
  entityTypeIds?: number[];
  entityTypeId?: number;
  productCategoryId: number;

  constructor(model?: Partial<EntityDocumentType>) {
    super(model);

    Object.assign(this, model);
  }

  public static toDto(item: Partial<EntityDocumentType>): any {
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      entityTypeIds: item?.entityTypeIds,
      entityTypeId: item?.entityTypeId,
      productCategoryId: item.productCategoryId,
      isActive: item.isActive,
    };
  }
}
