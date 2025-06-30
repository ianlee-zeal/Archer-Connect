// eslint-disable-next-line import/no-cycle
import { Payment } from '../payment';

export class PaymentItemListResponse {
  payments: Payment[];
  amount: number;
  firstName: string;
  lastName: string;
  organizationName: string;
  caseName: string;
  processLogDocId?: number;

  public static toModel(item: any): PaymentItemListResponse {
    if (item) {
      return {
        payments: item.payments.map(Payment.toModel),
        amount: item.amount,
        firstName: item.firstName,
        lastName: item.lastName,
        organizationName: item.organizationName,
        caseName: item.caseName,
        processLogDocId: item?.processLogDocId,
      };
    }
    return null;
  }
}
