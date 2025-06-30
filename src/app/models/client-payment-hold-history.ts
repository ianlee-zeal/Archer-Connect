export class ClientPaymentHoldHistory {
  id: number;
  clientPaymentStateName: string;
  holdTypeName: string;
  holdTypeReasonName: string;
  responsibleName: string;
  lastModifiedDate: Date;
  followUpDate: Date;
  description: string;

  constructor(model?: ClientPaymentHoldHistory) {
    Object.assign(this, model);
  }

  public static toModel(item: any): ClientPaymentHoldHistory {
    if (!item) {
      return null;
    }
    return {
      id: item.id,
      clientPaymentStateName: item.clientPaymentStateName,
      holdTypeName: item.holdTypeName,
      holdTypeReasonName: item.holdTypeReasonName,
      responsibleName: item.responsibleName,
      lastModifiedDate: item.lastModifiedDate,
      followUpDate: item.followupDate,
      description: item.description,
    };
  }
}
