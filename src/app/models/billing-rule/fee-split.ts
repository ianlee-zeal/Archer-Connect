import { IdValue } from '../idValue';

export class FeeSplit {
  id: number;
  org: IdValue;
  orgName: string;
  billTo: IdValue;
  feePercentage: number;

  public static toModel(item: FeeSplitDto): FeeSplit {
    if (!item) return null;

    return {
      id: item.id,
      org: item.org,
      orgName: item.org.name,
      billTo: item.billTo,
      feePercentage: item.feePct / 100,
    };
  }

  public static toDto(item: any): FeeSplitDto {
    if (!item) return null;

    return {
      id: item.id,
      billingRuleId: item.billingRuleId,
      org: undefined,
      orgId: item.org?.id,
      billTo: item.billTo,
      feePct: item.feePercentage * 100,
    };
  }
}

export interface FeeSplitDto {
  id: number;
  billingRuleId: number;
  orgId: number;
  org: IdValue;
  billTo: IdValue;
  feePct: number;
}
