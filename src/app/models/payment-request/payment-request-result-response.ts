export class PaymentRequestResultResponse {
  name: string;
  summary: string;
  totalRows: number;
  processLogDocId?: number;
  transferCount?: number;

  public static toModel(item: any): PaymentRequestResultResponse {
    if (item) {
      return {
        name: item.name,
        summary: item.summary,
        totalRows: item.totalRows,
        processLogDocId: item.processLogDocId,
      };
    }
    return null;
  }
}
