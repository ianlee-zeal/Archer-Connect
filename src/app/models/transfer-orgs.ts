import { BankAccount } from './bank-account';
import { Org } from './org';

export class TransferOrgs {
  qsfOrgs: Org[];
  qsfBankAccounts: BankAccount[];

  constructor(model?: TransferOrgs) {
    Object.assign(this, model);
  }

  public static toModel(item: any): TransferOrgs {
    if (item) {
      return {
        qsfOrgs: item.qsfOrgs,
        qsfBankAccounts: item.qsfBankAccounts,
      };
    }

    return null;
  }
}
