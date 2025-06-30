import { CommonHelper } from '@app/helpers';

export class PaymentInstruction {
  id: number;
  payeeEntityTypeId: number = null;
  payeeEntityId: number = null;
  paymentMethodId?: number = null;
  payeeAddressId?: number = null;
  payeeBankAccountId: number = null;
  payeeBankAccountName: string = null;
  payeeBankAccountNumber: string = null;
  payeeEmailId: number = null;
  percentage?: number = null;
  description?: string = null;
  memoText?: string = null;
  payeeNotExist: boolean;
  paymentTrackingStatus?: string = null;
  referenceNumber?: string = null;
  tracking?: string = null;
  dateCreated?: Date = null;
  dateSent?: Date = null;
  statusId?: number = null;
  statusName?: string = null;
  nameOnPayment?: string = null;
  furtherCreditAccount?: string = null;
  qsfBankAccountId?: number = null;
  qsfOrgId?: number = null;
  transferToSubAccount?: boolean = null;
  transferFFC?: string = null;

  constructor(public readonly claimSettlementLedgerEntryId: number, public amount: number = null) {
    this.id = CommonHelper.createEntityUniqueId();
  }
}
