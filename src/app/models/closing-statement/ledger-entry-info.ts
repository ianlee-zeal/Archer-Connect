import { DateHelper } from '@app/helpers/date.helper';
import { IdValue } from '../idValue';
import { Auditable } from '../auditable';
import { PaymentInstruction } from '../payment-instruction';

export class LedgerEntryInfo extends Auditable {
  id: number;
  accountNumber: string;
  defaultDisplay: string;
  displayOverride: string;
  description: string;
  percentage: number;
  amount: number;
  accountGroup: string;
  status: IdValue;
  date: Date;

  type: string;
  enabled: boolean;
  payee: string;
  sendPaymentTo: string;
  payerAccount: string;

  paymentId: number;
  paymentTrackingStatus: string;
  referenceNumber: string;
  tracking: string;
  dateCreated: Date;
  dateSent: Date;

  splitTypeId: number;
  isPaymentEnabled: boolean;
  isPaymentEnabledVisible: boolean;
  paymentInstructions: PaymentInstruction[];
  statusId: number;

  notes: string;
  enableIndividualAuthorize: boolean;

  transfer: boolean;

  public static toModel(item: any): LedgerEntryInfo {
    if (item) {
      return {
        ...super.toModel(item),
        id: item.id,
        accountNumber: item.accountNumber,
        defaultDisplay: item.defaultDisplay,
        displayOverride: item.displayOverride,
        description: item.description,
        percentage: item.percentage,
        amount: item.amount,
        accountGroup: item.accountGroup,
        status: item.status,
        date: DateHelper.toLocalDate(item.date),
        type: item.type,
        enabled: item.enabled,
        payee: item.payee,
        sendPaymentTo: item.sendPaymentTo,
        payerAccount: item.payerAccount,
        paymentTrackingStatus: item.paymentTrackingStatus,
        referenceNumber: item.referenceNumber,
        tracking: item.tracking,
        dateCreated: DateHelper.toLocalDate(item.dateCreated),
        dateSent: DateHelper.toLocalDate(item.dateSent),
        isPaymentEnabled: item.isPaymentEnabled,
        isPaymentEnabledVisible: item.isPaymentEnabledVisible,
        paymentInstructions: item.claimSettlementLedgerPaymentInstruction,
        splitTypeId: item.splitTypeId,
        statusId: item.status.id,
        paymentId: item.paymentId,
        notes: item.notes,
        enableIndividualAuthorize: item.enableIndividualAuthorize,
        transfer: item.transfer,
      };
    }

    return null;
  }
}
