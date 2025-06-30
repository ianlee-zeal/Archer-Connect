import { IdValue } from './idValue';

export class TimeZone implements IdValue {
  id: number;
  name: string;
  description: string;

  constructor(model?: TimeZone) {
    Object.assign(this, model);
  }

  public static toModel(item: any): TimeZone {
    if (item) {
      return {
        id: item.id,
        name: item.name,
        description: item.description,
      };
    }

    return null;
  }
}
