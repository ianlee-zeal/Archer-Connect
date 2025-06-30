import { ClientPaymentHold } from './client-payment-hold';
import { Stage } from './stage';
import { Status } from './status';

export class DisbursementClaimantSummary {
  archerId: number;
  firstName: string;
  lastName: string;
  attorneyReferenceId: string;
  primaryFirm: string;
  disbursementGroupId: number;
  disbursementGroupName: string;
  disbursementGroupAmount: number;
  income: number;
  mdl: number;
  cbf: number;
  attyFeesNetFees: number;
  liens: number;
  otherLiens: number;
  expenses: number;
  archerFees: number;
  otherFees: number;
  net: number;
  stage: Stage;
  medicalLiensOverallStatus: string;
  medicalLiensOverallStatusLight: string;
  claimantNetDisbursed: number;
  bankruptcyOverallStatus: string;
  releaseOverallStatus: string;
  probateOverallStatus: string;
  bankruptcyOverallStage: string;
  releaseOverallStage: string;
  probateOverallStage: string;
  bankruptcyFinalDate: Date | null;
  bankruptcyAbandoned: boolean | null;
  bankruptcyClosingStatementNeeded: boolean | null;
  bankruptcyReadyToPayTrustee: boolean | null;
  bankruptcyAmountToTrustee: number | null;
  bankruptcyAmountToAttorney: number | null;
  bankruptcyAmountToClaimant: number | null;
  clientId: number;
  claimSettlementLedgerId: number;
  disbursementGroupClaimantId: number;
  balance: number;
  netDisbursementOutstanding: number;
  holdTypeReason: ClientPaymentHold;
  cashBalance: number;
  coA51010Amount: number;
  coA50920Amount: number;
  coA50195Amount: number;
  coA54920Amount: number;
  coA52910Amount: number;
  coA53920Amount: number;
  unpaidMDL: number;
  unpaidCBF: number;
  unpaidAttyFees: number;
  unpaidAttyExpenses: number;
  unpaidLiens: number;
  unpaidArcherFees: number;
  unpaidOtherFees: number;
  unpaid3rdParty: number;
  orgId: number;
  holdbackAmount: number;
  electronicDeliveryEnabled: boolean;
  backwardFromPrevStage: boolean;
  firmApprovedStatusName: string;
  firmApprovedStatusId: number;
  stageLastModifiedDate: Date | null;
  clientPrimaryEmail: string;
  spi: boolean;
  probateSpiSyncedStatusId: number;
  probateSpiSyncedStatusName: string;
  lienStatusFinalized: boolean | null;
  lienStatusFinalizedName: string;
  bKScrubStatusId: number | null;
  bKScrubStatus: string | null;
  bKScrubLastDate: Date | null;
  bKScrubProductCode: string;
  bKScrubMatchCode: string;
  bKScrubRemovalDate: Date | null;
  digitalPaymentStatus: string;
  claimantStatus: Status;
  claimantFundedDate: Date | null;

  constructor(model?: Partial<DisbursementClaimantSummary>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): DisbursementClaimantSummary | null {
    if (item) {
      return {
        archerId: item.archerId,
        firstName: item.firstName,
        lastName: item.lastName,
        primaryFirm: item.primaryFirm,
        attorneyReferenceId: item.attorneyReferenceId,
        disbursementGroupId: item.disbursementGroupId,
        disbursementGroupName: item.disbursementGroupName,
        disbursementGroupAmount: item.disbursementGroupAmount,
        income: item.income,
        mdl: item.mdl,
        cbf: item.cbf,
        attyFeesNetFees: item.attyFeesNetFees,
        liens: item.liens,
        otherLiens: item.otherLiens,
        expenses: item.expenses,
        archerFees: item.archerFees,
        otherFees: item.otherFees,
        net: item.net,
        stage: item.stage,
        medicalLiensOverallStatus: item.medicalLiensOverallStatus,
        medicalLiensOverallStatusLight: item.medicalLiensOverallStatusLight,
        bankruptcyOverallStatus: item.bankruptcyOverallStatus,
        releaseOverallStatus: item.releaseOverallStatus,
        probateOverallStatus: item.probateOverallStatus,
        bankruptcyOverallStage: item.bankruptcyOverallStage,
        releaseOverallStage: item.releaseOverallStage,
        probateOverallStage: item.probateOverallStage,
        bankruptcyFinalDate: item.bankruptcyFinalDate,
        bankruptcyAbandoned: item.bankruptcyAbandoned,
        bankruptcyClosingStatementNeeded: item.bankruptcyClosingStatementNeeded,
        bankruptcyReadyToPayTrustee: item.bankruptcyReadyToPayTrustee,
        bankruptcyAmountToTrustee: item.bankruptcyAmountToTrustee,
        bankruptcyAmountToAttorney: item.bankruptcyAmountToAttorney,
        bankruptcyAmountToClaimant: item.bankruptcyAmountToClaimant,
        clientId: item.clientId,
        claimSettlementLedgerId: item.claimSettlementLedgerId,
        disbursementGroupClaimantId: item.disbursementGroupClaimantId,
        balance: item.balance,
        netDisbursementOutstanding: item.netDisbursementOutstanding,
        holdTypeReason: ClientPaymentHold.toModel(item.holdTypeReason),
        cashBalance: item.cashBalance,
        coA51010Amount: item.coA51010Amount,
        coA50920Amount: item.coA50920Amount,
        coA50195Amount: item.coA50195Amount,
        coA54920Amount: item.coA54920Amount,
        coA52910Amount: item.coA52910Amount,
        coA53920Amount: item.coA53920Amount,
        holdbackAmount: item.holdbackAmount,
        unpaidMDL: item.unpaidMDL,
        unpaidCBF: item.unpaidCBF,
        unpaidAttyFees: item.unpaidAttyFees,
        unpaidAttyExpenses: item.unpaidAttyExpenses,
        unpaidLiens: item.unpaidLiens,
        unpaidArcherFees: item.unpaidArcherFees,
        unpaidOtherFees: item.unpaidOtherFees,
        unpaid3rdParty: item.unpaid3rdParty,
        orgId: item.orgId,
        electronicDeliveryEnabled: item.electronicDeliveryEnabled,
        backwardFromPrevStage: item.backwardFromPrevStage,
        firmApprovedStatusName: item.firmApprovedStatusName,
        firmApprovedStatusId: item.firmApprovedStatusId,
        stageLastModifiedDate: item.stageLastModifiedDate,
        clientPrimaryEmail: item.clientPrimaryEmail,
        claimantNetDisbursed: item.claimantNetDisbursed,
        spi: item.spi,
        probateSpiSyncedStatusId: item.probateSpiSyncedStatusId,
        probateSpiSyncedStatusName: item.probateSpiSyncedStatusName,
        lienStatusFinalized: item.lienStatusFinalized,
        lienStatusFinalizedName: item.lienStatusFinalizedName,
        bKScrubStatusId: item.bkScrubStatusId,
        bKScrubStatus: item.bkScrubStatus,
        bKScrubLastDate: item.bkScrubLastDate,
        bKScrubProductCode: item.bkScrubProductCode,
        bKScrubMatchCode: item.bkScrubMatchCode,
        bKScrubRemovalDate: item.bkScrubRemovalDate,
        digitalPaymentStatus: item.digitalPaymentStatus,
        claimantStatus: item.claimantStatus,
        claimantFundedDate: item.claimantFundedDate,
      };
    }

    return null;
  }
}
