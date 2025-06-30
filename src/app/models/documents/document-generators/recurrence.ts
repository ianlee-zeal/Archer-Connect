import { Auditable } from '@app/models/auditable';

export class Recurrence extends Auditable {

  constructor(model?: Partial<Recurrence>) {
      super();
      Object.assign(this, model);
  }

  public static toModel(item: any): Recurrence {
    if (item) {
      return {
        ...super.toModel(item),
      };
    }
  }
}