import { IdValue } from './idValue';

export class Status implements IdValue {
  id: number;
  name: string;
  code: string;
  entityType: any;

  constructor(model?: Partial<Status>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): Status | null {
    if (item) {
      return {
        id: item.id,
        name: item.name,
        code: item.code,
        entityType: item.entityType,
      };
    }
    return null;
  }
}
