import { Page } from '@app/models/page';
import { ClaimSettlementLedger } from './closing-statement/claim-settlement-ledger';

export class LedgerInfoSearchResult {
  public hasInvalidStagesForFirmFeeAndExpenseGeneration: boolean;
  public hasInvalidStagesForClosingStatementGeneration: boolean;
  public hasAtLeastOneLedgerWithFundedDate: boolean;
  public page: Page<ClaimSettlementLedger>;

  public static toModel(item: any): LedgerInfoSearchResult {
    if (!item) return null;

    return {
      page: {
        totalRecordsCount: item.page.totalRecordsCount,
        items: item.page.items.map(ClaimSettlementLedger.toModel),
      },
      hasInvalidStagesForFirmFeeAndExpenseGeneration: item.hasInvalidStagesForFirmFeeAndExpenseGeneration,
      hasInvalidStagesForClosingStatementGeneration: item.hasInvalidStagesForClosingStatementGeneration,
      hasAtLeastOneLedgerWithFundedDate: item.hasAtLeastOneLedgerWithFundedDate
    };
  }
}
