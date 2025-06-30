import { DateHelper } from '@app/helpers';
import { IdValue } from '../idValue';

export class QSFAdminItem {
  disbursementGroupName: string;
  ledgerStage: string;
  claimantPayment?: IdValue;
  disbursementAmount?: number;
  payee: string;
  dwSentToFirmDate?: Date;
  dwApprovedDate?: Date;
  csSentDate?: Date;
  efRecDate: Date;
  isCSSentStage: boolean;
  holdReason: boolean;
  paidWithHB: boolean;
  holdbackAmount?: number;
  firmPaid: string;
  ledgerId: number;

  public static toModel(item: any): QSFAdminItem {
    if (!item) {
      return null;
    }

    return {
      disbursementGroupName: item.disbursementGroupName,
      ledgerStage: item.ledgerStage,
      isCSSentStage: item.isCSSentStage,
      claimantPayment: item.claimantPayment,
      disbursementAmount: item.disbursementAmount,
      payee: item.payee,
      dwSentToFirmDate: DateHelper.toLocalDate(item.dwSentToFirmDate),
      dwApprovedDate: DateHelper.toLocalDate(item.dwApprovedDate),
      csSentDate: DateHelper.toLocalDate(item.csSentDate),
      efRecDate: DateHelper.toLocalDate(item.efRecDate),
      holdReason: item.holdReason,
      paidWithHB: item.paidWithHB,
      holdbackAmount: item.holdbackAmount,
      firmPaid: item.firmPaid,
      ledgerId: item.ledgerId,
    };
  }
}
