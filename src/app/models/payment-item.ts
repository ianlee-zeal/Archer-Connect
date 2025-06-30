export class PaymentItem {
  claimantId: number;
  claimantName: string;

  constructor(model?: Partial<PaymentItem>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): PaymentItem {
    return {
      claimantId: item.claimantId,
      claimantName: item.claimantName,
    };
  }
}
