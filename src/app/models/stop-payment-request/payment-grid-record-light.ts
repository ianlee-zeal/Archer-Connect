// eslint-disable-next-line import/no-cycle
import { StopPaymentRequestGrid } from './stop-payment-request-grid';

export class PaymentGridRecordLight {
  id: number;
  projectName: string;
  referenceNumber: string;
  payeeName: string;
  payerName: string;
  amount: number;
  dateSent: Date;
  payeeExternalId: string;
  stopPaymentRequest: StopPaymentRequestGrid;
  stopPaymentRequestId: number;
  checkVerificationsCount: number;

  constructor(model?: Partial<PaymentGridRecordLight>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): PaymentGridRecordLight {
    return {
      id: item.id,
      referenceNumber: item.referenceNumber,
      payeeName: item.payeeName,
      amount: item.amount,
      dateSent: item.dateSent,
      payeeExternalId: item.payeeExternalId,
      payerName: item.payerName,
      stopPaymentRequest: StopPaymentRequestGrid.toModel(item.stopPaymentRequest),
      stopPaymentRequestId: item.stopPaymentRequestId,
      projectName: item.projectName,
      checkVerificationsCount: item.checkVerificationsCount,
    };
  }
}
