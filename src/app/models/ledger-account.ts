export class LedgerAccount {
  accountName: string;
  accountNo: number;
  claimantsCount: number;

  constructor(model?: Partial<LedgerAccount>) {
    Object.assign(this, model);
  }

  public static toModel(item: LedgerAccount): LedgerAccount {
    if (!item) {
      return null;
    }

    return {
      accountName: item.accountName,
      accountNo: item.accountNo,
      claimantsCount: item.claimantsCount,
    };
  }
}
