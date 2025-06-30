import { PaymentMethod } from '../payment-method';
import { StopPaymentRequest } from '../stop-payment-request';

export class ClaimantOverviewPaymentItem {
  id: number;
  disbursementType: string;
  payeeName: string;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  amount: number;
  dateSubmitted: Date;
  trackingNumber: string;
  payeeAddress1: string;
  payeeAddress2: string;
  payeeAddressCity: string;
  payeeAddressState: string;
  payeeAddressZip: string;
  disbursementGroupName: string;
  stopPaymentRequest: StopPaymentRequest;
  itemAmount?: number;

  public static toModel(item: any): ClaimantOverviewPaymentItem {
    if (!item) {
      return null;
    }

    return {
      id: item.id,
      disbursementType: item.disbursementType,
      payeeName: item.payeeName,
      paymentMethod: PaymentMethod.toModel(item.paymentMethod),
      referenceNumber: item.referenceNumber,
      amount: item.amount,
      dateSubmitted: item.dateSubmitted,
      trackingNumber: item.trackingNumber,
      payeeAddress1: item.payeeAddress1,
      payeeAddress2: item.payeeAddress2,
      payeeAddressCity: item.payeeAddressCity,
      payeeAddressState: item.payeeAddressState,
      payeeAddressZip: item.payeeAddressZip,
      disbursementGroupName: item.disbursementGroupName,
      stopPaymentRequest: StopPaymentRequest.toModel(item.stopPaymentRequest),
      itemAmount: item.itemAmount,
    };
  }
}
