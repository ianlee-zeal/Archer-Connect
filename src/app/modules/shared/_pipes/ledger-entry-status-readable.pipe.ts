import { PipeTransform, Pipe } from '@angular/core';
import { ClaimSettlementLedgerEntryStatus } from '@app/models/enums';

@Pipe({ name: 'ledgerEntryStatusReadable' })
export class LedgerEntryStatusReadablePipe implements PipeTransform {
  transform(entryStatus: ClaimSettlementLedgerEntryStatus) {
    switch (entryStatus) {
      case ClaimSettlementLedgerEntryStatus.PartiallyPaid: return "Partially Paid";
      case ClaimSettlementLedgerEntryStatus.NonPayable: return "Non-Payable";
      case ClaimSettlementLedgerEntryStatus.PaymentAuthorized: return "Payment Authorized";

      default: return ClaimSettlementLedgerEntryStatus[entryStatus];
    }
  }
}
