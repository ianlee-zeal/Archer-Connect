import { BatchActionReviewOption } from './batch-action-review-option';

export class BatchActionReviewOptions {
  options: BatchActionReviewOption[];
  totalLedgers: number;
  totalErroredLedgers: number;

  public static toModel(item: any): BatchActionReviewOptions {
    if (item) {
      return {
        options: item.options.map(BatchActionReviewOption.toModel),
        totalLedgers: item.totalLedgers,
        totalErroredLedgers: item.totalErroredLedgers,
      };
    }
    return null;
  }
}
