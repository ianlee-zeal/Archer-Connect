import { ClientPaymentHold } from './client-payment-hold';
import { DisbursementGroupSummary } from './disbursement-group-summary';
import { Status } from './status';

export class ClaimantSummaryRollup {
  id: number;
  archerId: number;
  firstName: string;
  lastName: string;
  primaryFirm: string;
  totalAllocation: number;
  attorneyReferenceId: string;
  cleanAttorneyReferenceId: string;
  holdTypeReason: ClientPaymentHold;
  disbursementGroupSummary: DisbursementGroupSummary;
  bKScrubStatusId: number | null;
  bKScrubStatus: string | null;
  bKScrubLastDate: Date | null;
  bKScrubProductCode: string;
  bKScrubMatchCode: string;
  bKScrubRemovalDate: Date | null;
  statusId: number | null; /* Need this for filtering/sorting against Client Index w/o additional logic */
  claimantStatus: Status;

  public static toModel(item: any): ClaimantSummaryRollup | null {
    if (item) {
      return {
        id: item.id,
        archerId: item.archerId,
        firstName: item.firstName,
        lastName: item.lastName,
        primaryFirm: item.primaryFirm,
        totalAllocation: item.totalAllocation,
        attorneyReferenceId: item.attorneyReferenceId,
        cleanAttorneyReferenceId: item.cleanAttorneyReferenceId,
        holdTypeReason: ClientPaymentHold.toModel(item.holdTypeReason),
        disbursementGroupSummary: DisbursementGroupSummary.toModel(item.disbursementGroupSummary),
        bKScrubStatusId: item.bkScrubStatusId,
        bKScrubStatus: item.bkScrubStatus,
        bKScrubLastDate: item.bkScrubLastDate,
        bKScrubProductCode: item.bkScrubProductCode,
        bKScrubMatchCode: item.bkScrubMatchCode,
        bKScrubRemovalDate: item.bkScrubRemovalDate,
        statusId: item.statusId,
        claimantStatus: item.claimantStatus,
      };
    }

    return null;
  }
}
