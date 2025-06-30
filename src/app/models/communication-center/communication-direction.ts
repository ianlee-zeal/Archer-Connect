import { Auditable } from '../auditable';

export class CommunicationDirection extends Auditable {
  id: number;
  displayName: string;
  orderSeq: number;
  active: boolean;

  constructor(model?: Partial<CommunicationDirection>) {
    super();
    Object.assign(this, model);
  }

  public static toModel(item: any): CommunicationDirection {
    if (item) {
      return {
        ...super.toModel(item),
        id: item.id,
        displayName: item.displayName,
        orderSeq: item.orderSeq,
        active: item.active,
      };
    }

    return null;
  }
}
