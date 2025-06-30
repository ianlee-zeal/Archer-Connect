import { IdValue } from './idValue';

export class LedgerStageWithClaimantCount {
  public stage: IdValue;
  public claimantsCount: number;

  public static toModel(item: any): LedgerStageWithClaimantCount {
    if (!item) return null;

    return {
      stage: item.stage,
      claimantsCount: item.claimantsCount,
    };
  }
}
