import { LedgerValue } from './ledger-value';

export class AccountGroupTotalValue {
  isPercentageMode: boolean;
  hasChangedPaidItems: boolean;
  hasPaidItems: boolean;
  hasError: boolean;
  amount?: number;
  newAmount?: number;
  initialLedgerEntryValues: LedgerValue[] = [];
}
