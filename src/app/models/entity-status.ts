import { EntityTypeEnum } from './enums';

export class EntityStatus {
  public id: number;
  public name: string;
  public code: string;
  public entityTypeId: EntityTypeEnum;

  public static toModel(item): EntityStatus {
    if (!item) {
      return null;
    }

    return {
      id: item.id,
      name: item.name,
      code: item.code,
      entityTypeId: item.entityTypeId,
    };
  }
}
