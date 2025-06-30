import { IdValue } from '../idValue';

export class ChartOfAccount implements IdValue {
  id: number;
  name: string;
  accountNo: string;
  accountGroupNo: string;
  accountType: string;
  includeInGLBalance: boolean;
  isPaymentEnabledRequired?: boolean;
  refundsAllowed: boolean;

  public static toModel(item: any): ChartOfAccount {
    if (item) {
      return {
        id: item.id,
        name: item.name,
        accountNo: item.accountNo,
        accountGroupNo: item.accountGroupNo,
        accountType: item.accountType,
        includeInGLBalance: item.includeInGLBalance,
        isPaymentEnabledRequired: item.isPaymentEnabledRequired,
        refundsAllowed: item.refundsAllowed,
      };
    }
    return null;
  }
}
