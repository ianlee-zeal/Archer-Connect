import { IdValue } from './idValue';

export class DisbursementGroupType implements IdValue {
  id: number;
  name: string;

  static toModel(item: any): DisbursementGroupType {
    if (!item) {
      return null;
    }

    return {
      id: item.id,
      name: item.name,
    };
  }
}
