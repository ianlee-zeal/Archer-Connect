import { LedgerVarianceGroupEntry } from './ledger-variance-group-entry';

export class LedgerVariance {
  id: number;
  accountGroupNo: string;
  description: string;
  previousValue: number;
  newValue: number;
  amount: number;
  percentage: number;
  groupEntries: LedgerVarianceGroupEntry[];

  static toModel(item: any): LedgerVariance {
    if (!item) {
      return null;
    }

    return {
      id: item.id,
      accountGroupNo: item.accountGroupNo,
      description: item.description,
      previousValue: item.previousValue,
      newValue: item.newValue,
      amount: item.amount,
      percentage: item.percentage,
      groupEntries: item.groupEntries,
    };
  }
}
