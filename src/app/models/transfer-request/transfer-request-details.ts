export class TransferRequestDetails {
  requestor: string;
  qsf: string;
  legalName: string;
  archerConnectName: string;
  transferItemRequestId: number;
  statusName: string;
  statusId: number;
  payee: string;
  payeeId: string | null;
  amount: number;
  caseName: string;
  archerConnectId: number | null;
  acPaymentId: string;

  lineOne: string;
  lineTwo: string;
  addressee: string;
  city: string;
  country: string;
  state: string;
  zip: string;

  bankName: string;

  checkMemo: string;
}
