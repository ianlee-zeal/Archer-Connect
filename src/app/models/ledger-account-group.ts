export class LedgerAccountGroup {
  accountGroupName: string;
  accountGroupNo: number;
  claimantsCount: number;

  constructor(model?: Partial<LedgerAccountGroup>) {
    Object.assign(this, model);
  }

  public static toModel(item: LedgerAccountGroup): LedgerAccountGroup {
    if (!item) {
      return null;
    }

    return {
      accountGroupName: item.accountGroupName,
      accountGroupNo: item.accountGroupNo,
      claimantsCount: item.claimantsCount,
    };
  }
}
