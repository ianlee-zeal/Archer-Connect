import { IdValue } from './idValue';

export class HoldType {
  public id: number;
  public name: string;
  public holdTypeReasons: IdValue[];

  public static toModel(item): HoldType {
    if (!item) {
      return null;
    }

    return {
      id: item.id,
      name: item.name,
      holdTypeReasons: item.holdTypeReasons,
    };
  }
}
