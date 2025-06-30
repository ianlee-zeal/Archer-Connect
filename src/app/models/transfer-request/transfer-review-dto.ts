import { RequestReviewOption } from '../payment-request/payment-request-review-result';

export class TransferRequestDto {
  id: number;
  batchActionId: number;
  reviewOptions: RequestReviewOption[];
  reviewOptionsDocId?: number | null;

  constructor(
    batchActionId: number,
    reviewOptions: RequestReviewOption[],
    reviewOptionsDocId?: number | null,
  ) {
    this.batchActionId = batchActionId;
    this.reviewOptions = reviewOptions;
    this.reviewOptionsDocId = reviewOptionsDocId;
  }
}
