import { DisbursementGroup } from './disbursement-group';

export class ClaimantDisbursementGroup {
  id: number;
  disbursementGroupId: number;
  clientId: number;
  totalSettlementAmount: number;
  disbursementGroup: DisbursementGroup;

  public static toModel(item): ClaimantDisbursementGroup {
    if (!item) {
      return null;
    }

    return {
      id: item.id,
      disbursementGroupId: item.disbursementGroupId,
      clientId: item.clientId,
      totalSettlementAmount: item.totalSettlementAmount,
      disbursementGroup: DisbursementGroup.toModel(item.disbursementGroup),
    };
  }
}
