import { IdValue } from './idValue';

export class Channel implements IdValue {
  id: number;
  name: string;
  code: string;

  constructor(model?: Partial<Channel>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): Channel | null {
    if (item) {
      return {
        id: item.id,
        name: item.name,
        code: item.code,
      };
    }

    return null;
  }
}
