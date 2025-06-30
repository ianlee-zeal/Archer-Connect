import { IdValue } from '../idValue';

export class PaymentRequestDetails {
  payee: string;
  payeeId: number | null;
  paymentType: string;
  amount: number;
  numberOfClients: number;
  paymentMethod: number | null;
  payeeAddress1: string;
  payeeAddress2: string;
  payeeAddressCity: string;
  payeeAddressCountry: string;
  payeeAddressState: string;
  payeeAddressZip: string;
  payeeRoutingNumber: string;
  payeeAccountNumber: string;
  totalAmount: number;
  userDisplayName: string;
  caseName: string;
  qsfCompanyName: string;
  payerBankName: string;
  paymentItemTypeId: number | null;
  paymentItemTypeName: string;
  attachments: IdValue[];
  paymentStatusName: string;
  paymentId: number;
  payeeEntityTypeId: number;
  clientId: string;
  checkMemo: string;
}
