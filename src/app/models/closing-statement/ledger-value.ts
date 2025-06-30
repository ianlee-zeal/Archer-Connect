export class LedgerValue {
  id: number;
  accountNo: string;
  statusId: number;
  isPaidItem: boolean;
  accountType: string;
  hasError: boolean;
  amount?: number;
  newAmount?: number;
  percentage?: number;
  newPercentage?: number;
}
