export class ClientPaymentHold {
  id: number;
  clientId?: number;
  holdTypeId: number;
  holdTypeReasonId: number;
  holdTypeReasonName?: string;
  followUpDate: Date;
  description: string;

  constructor(model?: ClientPaymentHold) {
    Object.assign(this, model);
  }

  public static toModel(item: any): ClientPaymentHold {
    if (!item) {
      return null;
    }
    return {
      id: item.id,
      clientId: item?.clientId,
      holdTypeId: item?.holdTypeId,
      holdTypeReasonId: item.holdTypeReasonId,
      holdTypeReasonName: item?.holdTypeReasonName,
      followUpDate: item?.followUpDate ? new Date(item.followUpDate) : null,
      description: item.description,
    };
  }
}

export interface IRemovePaymentFromHoldRequest {
  clientPaymentHoldId: number;
  description: string;
}
