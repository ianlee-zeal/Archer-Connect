import { Auditable } from '../auditable';

export class CommunicationResult extends Auditable {
  id: number;
  displayName: string;
  orderSeq: number;
  active: boolean;

  constructor(model?: Partial<CommunicationResult>) {
    super();
    Object.assign(this, model);
  }

  public static toModel(item: any): CommunicationResult {
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
