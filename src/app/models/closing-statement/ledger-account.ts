/* eslint-disable import/no-cycle */
import { IdValue } from '../idValue';
import { LedgerEntry } from './ledger-entry';

export class LedgerAccount implements IdValue {
  id: number;
  name: string;
  accountGroupNo: string;
  accountNo: string;
  payeeOrgId: number;
  totalAmount: number;
  totalPercentage: number;
  totalPaidAmount: number;
  accountType: string;
  canEditAttyFirmFeesEntry?: boolean;
  entries: LedgerEntry[];

  public static toModel(item: any): LedgerAccount {
    if (item) {
      return {
        id: item.id,
        name: item.name,
        accountGroupNo: item.accountGroupNo,
        accountNo: item.accountNo,
        payeeOrgId: item.payeeOrgId,
        totalAmount: item.totalAmount,
        totalPercentage: item.totalPercentage,
        totalPaidAmount: item.totalPaidAmount,
        accountType: item.accountType,
        canEditAttyFirmFeesEntry: item.canEditAttyFirmFeesEntry,
        entries: item.entries?.map(i => LedgerEntry.toModel(i))
      };
    }

    return null;
  }
}
