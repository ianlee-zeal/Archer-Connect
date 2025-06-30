export class PaymentRequestReviewResultIssue {
  severityId: number;
  summary: string;

  public static toModel(item: any): PaymentRequestReviewResultIssue {
    if (item) {
      return {
        severityId: item.severityId,
        summary: item.summary,
      };
    }
    return null;
  }
}
