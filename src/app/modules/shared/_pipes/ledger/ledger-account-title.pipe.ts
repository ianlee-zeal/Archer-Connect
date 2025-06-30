import { PipeTransform, Pipe } from '@angular/core';
import { LedgerAccount } from '@app/models/closing-statement';

@Pipe({ name: 'ledgerAccountTitle' })
export class LedgerAccountTitlePipe implements PipeTransform {
  transform(account: LedgerAccount) {
    return account.accountNo
      ? `${account.accountNo} - ${account.name}`
      : account.name;
  }
}
