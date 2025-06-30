import { Auditable } from '../auditable';
import { IdValue } from '../idValue';

export class LedgerSummary extends Auditable {
  id: number;
  disbursementGroup: IdValue | null;
  grossAllocation: number;
  feeExpenses: number;
  netAllocation: number;
  isFirmApproved: boolean;
  currentVersion: number;
  stage: IdValue;

  static toModel(item: any): LedgerSummary {
    if (!item) {
      return null;
    }

    return {
      ...Auditable.toModel(item),
      id: item.id,
      disbursementGroup: item.disbursementGroup,
      grossAllocation: item.grossAllocation,
      feeExpenses: item.feeExpenses,
      netAllocation: item.netAllocation,
      isFirmApproved: item.isFirmApproved,
      currentVersion: item.currentVersion,
      stage: item.stage,
    };
  }
}
