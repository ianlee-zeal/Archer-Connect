export class LedgerVarianceGroupEntry {
  amount: number;
  previousValue: number;
  newValue: number;
  percentage: number;
  accountNo: string;
  name: string;
  entryType: number;
  ledgerVersion: number;

  static toModel(item: any): LedgerVarianceGroupEntry {
    if (!item) {
      return null;
    }

    return {
      amount: item.amount,
      previousValue: item.previousValue,
      newValue: item.newValue,
      percentage: item.percentage,
      accountNo: item.accountNo,
      name: item.name,
      entryType: item.entryType,
      ledgerVersion: item.ledgerVersion,
    };
  }
}
