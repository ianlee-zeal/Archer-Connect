import { IdValue } from './idValue';

export class LienService {
  id: number;
  name: string;
  count: number;
  status: IdValue;
  sortOrder: number | undefined;

  public static toModel(item: any): LienService {
    if (!item) {
      return null;
    }

    return {
      id: item.id,
      name: item.name,
      status: item.status,
      count: item.count,
      sortOrder: item.sortOrder,
    };
  }
}
