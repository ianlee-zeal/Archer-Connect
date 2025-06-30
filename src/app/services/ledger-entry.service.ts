import { Injectable } from '@angular/core';
import { LedgerAccount, LedgerEntry } from '@app/models/closing-statement';
import { LedgerEntryInfo } from '@app/models/closing-statement/ledger-entry-info';
import { ClaimSettlementLedgerEntryStatus, LedgerAccountEnum, LedgerAccountGroup } from '@app/models/enums';

@Injectable({ providedIn: 'root' })
export class LedgerEntryService {
  public isPaid(ledgerEntry: LedgerEntry | LedgerEntryInfo): boolean {
    return ledgerEntry?.statusId === ClaimSettlementLedgerEntryStatus.Paid;
  }

  public isEntryPaymentAuthorized(entry: LedgerEntry): boolean {
    return entry.statusId === ClaimSettlementLedgerEntryStatus.PaymentAuthorized;
  }

  public isRequiredRelatedEntity(account: LedgerEntry, validateLienCredits: boolean = false): boolean {
    return this.canEditRelatedEntity(account) && (
      account.accountNo !== LedgerAccountEnum.LienCredit
      || (account.accountNo === LedgerAccountEnum.LienCredit && validateLienCredits)
    );
  }

  public canEditRelatedEntity(account: LedgerEntry | LedgerAccount): boolean {
    return account.accountGroupNo === LedgerAccountGroup.Liens
      && account.accountNo !== LedgerAccountEnum.LienCreditFromHoldback
      && account.accountNo !== LedgerAccountEnum.LiensTotal
      && account.accountNo !== LedgerAccountEnum.MedLienHoldback
      && account.accountNo !== LedgerAccountGroup.Liens;
  }
}
