import { Stage } from '../stage';

export class ClaimantOverviewReleaseAdminItem {
  stage: Stage;
  phaseId: number;
  allocation?: number;
  numberOfAllocation?: number;
  inGoodOrder: string;
  dateMailedToClaimant: Date;
  releaseRec: Date;
  submittedToDefense: Date;
  defenseApprovalDate: Date;
  percentComplete?: number;

  public static toModel(item: any): ClaimantOverviewReleaseAdminItem {
    if (!item) {
      return null;
    }

    return {
      stage: Stage.toModel(item.stage),
      phaseId: item.phaseId,
      allocation: item.allocation,
      numberOfAllocation: item.numberOfAllocation,
      inGoodOrder: item.inGoodOrder,
      dateMailedToClaimant: item.dateMailedToClaimant ? new Date(item.dateMailedToClaimant) : null,
      releaseRec: item.releaseRec ? new Date(item.releaseRec) : null,
      submittedToDefense: item.submittedToDefense ? new Date(item.submittedToDefense) : null,
      defenseApprovalDate: item.defenseApprovalDate ? new Date(item.defenseApprovalDate) : null,
      percentComplete: item.percentComplete,
    };
  }
}
