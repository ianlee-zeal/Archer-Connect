/* eslint-disable import/no-cycle */
import { DateHelper } from '@app/helpers/date.helper';
import { EntityType } from '@app/models/entity-type';
import { ProductCategoryDto } from '../product-workflow/product-category-dto';
import { User } from '../user';

export class DocumentType {
  id: number;
  name: string;
  isActive: boolean;
  isSystem: boolean;
  description: string;
  entityType: EntityType;
  productCategory: ProductCategoryDto;
  productCategoryId: number;
  createdDate: Date;
  lastModifiedBy: User;
  lastModifiedDate: Date;

  constructor(model?: Partial<DocumentType>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): DocumentType | null {
    if (item) {
      return {
        id: item.id,
        name: item.name,
        isActive: item.isActive,
        isSystem: item.isSystem,
        description: item.description,
        entityType: item.entityType,
        productCategory: ProductCategoryDto.toModel(item.productCategory),
        createdDate: DateHelper.toLocalDate(item.createdDate),
        lastModifiedBy: (item.lastModifiedBy && User.toModel(item.lastModifiedBy)) || null,
        lastModifiedDate: DateHelper.toLocalDate(item.lastModifiedDate),
        productCategoryId: item.productCategoryId,
      };
    }
    return null;
  }
}
