import { StringHelper } from '@app/helpers';
import { IdValue } from './idValue';

export class EntityType implements IdValue {
  id: number;
  name: string;
  category: IdValue;
  parent: EntityType;

  constructor(model?: Partial<EntityType>) {
    Object.assign(this, model);
  }

  public static toModel(item): EntityType {
    if (!item) {
      return null;
    }

    return {
      id: item.id,
      name: item.name,
      category: item.category,
      parent: EntityType.toModel(item.parent),
    };
  }

  static getName(type: string) {
    return StringHelper.equal(type, 'Probate Dashboards') ? 'Probate' : type;
  }
}
