export interface StartGeneratePaymentDocumentsJobRequest {
  paymentRequestId: number;
  channelName: string;
  paymentId?: number;
}
