import { IdValue } from "../idValue";
import { LedgerAccount } from "./ledger-account";

export class LedgerAccountGroup implements IdValue {
  id: number;
  name: string;
  accountGroupNo: string;
  accountNo: string;
  totalAmount: number;
  totalPaidAmount: number;
  totalPercentage: number;
  accounts: LedgerAccount[];

  public static toModel(item: any): LedgerAccountGroup {
    if (item) {
      return {
        id: item.id,
        name: item.name,
        accountGroupNo: item.accountGroupNo,
        accountNo: item.accountNo,
        totalAmount: item.totalAmount,
        totalPercentage: item.totalPercentage,
        totalPaidAmount: item.totalPaidAmount,
        accounts: item.accounts?.map(i => LedgerAccount.toModel(i))
      };
    }

    return null;
  }
}

