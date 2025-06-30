import { AppliedPaymentTypeEnum } from '../enums/applied-payment-type.enum';

export class RefundTransferItem {
  clientId: number;
  firstName: string;
  lastName: string;
  lienId: number;
  paymentType: AppliedPaymentTypeEnum;
  amount: string;
}
