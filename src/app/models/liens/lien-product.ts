import { IdValue } from '../idValue';

export class LienProduct {
  id: number;
  lienType: string;
  lienPaidDate?: Date;
  lienHolder: IdValue;
  collector: IdValue;

  constructor(model?: Partial<LienProduct>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): LienProduct | null {
    if (item) {
      return {
        id: item.id,
        lienType: item.lienType,
        lienPaidDate: item.lienPaidDate,
        lienHolder: item.lienHolder,
        collector: item.collector,
      };
    }

    return null;
  }
}
