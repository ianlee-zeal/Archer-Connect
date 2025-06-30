import { PipeTransform, Pipe } from '@angular/core';
import { LedgerAccountEnum, LedgerAccountGroup as LedgerAccountGroupEnum } from '@app/models/enums';
import { AccountGroupEntryTypeEnum } from '@app/models/enums/ledger-account-group-type.enum';

@Pipe({ name: 'ledgerEntryTypeTitle' })
export class LedgerEntryTypeTitlePipe implements PipeTransform {
  transform(accountGroupNo: string, accountNo: string) {
    switch (accountGroupNo) {
      case LedgerAccountGroupEnum.AttyExpenses: {
        return accountNo === LedgerAccountEnum.AttyExpenseHoldback
          ? `Attorney ${AccountGroupEntryTypeEnum[AccountGroupEntryTypeEnum.Expense]} Holdback`
          : `Attorney ${AccountGroupEntryTypeEnum[AccountGroupEntryTypeEnum.Expense]}`;
      }
      case LedgerAccountGroupEnum.AwardFunding: return `Award ${AccountGroupEntryTypeEnum[AccountGroupEntryTypeEnum.Funding]}`;
      case LedgerAccountGroupEnum.ARCHERFees: return `ARCHER ${AccountGroupEntryTypeEnum[AccountGroupEntryTypeEnum.Fee]}`;
      case LedgerAccountGroupEnum.OtherFees: return `Other ${AccountGroupEntryTypeEnum[AccountGroupEntryTypeEnum.Fee]}`;
      case LedgerAccountGroupEnum.ThirdPartyPMTS: return 'Payment';
      case LedgerAccountGroupEnum.Liens: return 'Lien';
      case LedgerAccountGroupEnum.MDL: return 'MDL';
      case LedgerAccountGroupEnum.CommonBenefit: return 'CBF';
      case LedgerAccountGroupEnum.AttyFees: {
        return accountNo === LedgerAccountGroupEnum.AttyFeesHoldback
          ? `Attorney ${AccountGroupEntryTypeEnum[AccountGroupEntryTypeEnum.Fee]} Holdback`
          : `Attorney ${AccountGroupEntryTypeEnum[AccountGroupEntryTypeEnum.Fee]}`;
      }

      default:
        return AccountGroupEntryTypeEnum[AccountGroupEntryTypeEnum.Fee];
    }
  }
}
