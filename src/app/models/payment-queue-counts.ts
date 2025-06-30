export class PaymentQueueCounts {
  pendingCount: number;
  authorizedCount: number;
  totalAmount: number;

  constructor(model?: Partial<PaymentQueueCounts>) {
    Object.assign(this, model);
  }

  public static toModel(item: PaymentQueueCounts): PaymentQueueCounts {
    if (!item) {
      return null;
    }

    return {
      pendingCount: item.pendingCount,
      authorizedCount: item.authorizedCount,
      totalAmount: item.totalAmount,
    };
  }
}
