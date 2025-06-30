export class PaymentRequest {
  Id: number;
  ReviewOptions: string;
  ReviewDocId?: number;
  ReviewLogDocId?: number;
  ProcessDocId: number;
  Message: string;
  LoadingDocId: number;
  LoadingDoc: any;
  ValidationPreviewDocumentId: number;
}
