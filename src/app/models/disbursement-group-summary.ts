export class DisbursementGroupSummary {
  claimantNetFullyDisbursed: boolean;
  netPaidInFull: boolean;
  expectedAllocation: number;
  assignedDisbursement: number;
  income: number;
  mdl: number;
  cbf: number;
  attyFeesAttyExpenses: number;
  liens: number;
  otherLiens: number;
  expenses: number;
  aRCHERFees: number;
  otherFees: number;
  net: number;
  balance: number;
  cashBalance: number;
  availableDisbursements: number;
  holdbackAttorneyFees: number;
  holdbackAttorneyExpenses: number;
  holdbackThirdPartyFees: number;
  holdbackLienFees: number;
  holdbackARCHERFees: number;
  holdbackOtherFees: number;
  lien: string;
  bankruptcy: string;
  probate: string;
  release: string;
  bankruptcyStage: string;
  probateStage: string;
  releaseStage: string;
  bankruptcyFinalDate: Date | null;
  bankruptcyAbandoned: boolean | null;
  bankruptcyClosingStatementNeeded: boolean | null;
  bankruptcyReadyToPayTrustee: boolean | null;
  bankruptcyAmountToTrustee: number | null;
  bankruptcyAmountToAttorney: number | null;
  bankruptcyAmountToClaimant: number | null;

  unpaidMDL: number;
  unpaidCBF: number;
  unpaidAttyFees: number;
  unpaidAttyExpenses: number;
  unpaidLiens: number;
  unpaidARCHERFees: number;
  unpaidOtherFees: number;
  unpaidOtherLiens: number;

  isPositiveUnpaidMDL: boolean;
  isPositiveUnpaidCBF: boolean;
  isPositiveUnpaidAttyFees: boolean;
  isPositiveUnpaidAttyExpenses: boolean;
  isPositiveUnpaidLiens: boolean;
  isPositiveUnpaidARCHERFees: boolean;
  isPositiveUnpaidOtherFees: boolean;
  isPositiveUnpaidOtherLiens: boolean;

  ledgerCount: number;

  public static toModel(item: any): DisbursementGroupSummary | null {
    if (item) {
      return {
        claimantNetFullyDisbursed: item.claimantNetFullyDisbursed,
        netPaidInFull: item.netPaidInFull,
        expectedAllocation: item.expectedAllocation,
        assignedDisbursement: item.assignedDisbursement,
        income: item.income,
        mdl: item.mdl,
        cbf: item.cbf,
        attyFeesAttyExpenses: item.attyFeesAttyExpenses,
        liens: item.liens,
        otherLiens: item.otherLiens,
        expenses: item.expenses,
        aRCHERFees: item.archerFees,
        otherFees: item.otherFees,
        net: item.net,
        balance: item.balance,
        cashBalance: item.cashBalance,
        availableDisbursements: item.availableDisbursements,
        holdbackAttorneyFees: item.holdbackAttorneyFees,
        holdbackAttorneyExpenses: item.holdbackAttorneyExpenses,
        holdbackThirdPartyFees: item.holdbackThirdPartyFees,
        holdbackLienFees: item.holdbackLienFees,
        holdbackARCHERFees: item.holdbackARCHERFees,
        holdbackOtherFees: item.holdbackOtherFees,
        lien: item.lien,
        bankruptcy: item.bankruptcy,
        probate: item.probate,
        release: item.release,
        bankruptcyStage: item.bankruptcyStage,
        probateStage: item.probateStage,
        releaseStage: item.releaseStage,
        bankruptcyFinalDate: item.bankruptcyFinalDate,
        bankruptcyAbandoned: item.bankruptcyAbandoned,
        bankruptcyClosingStatementNeeded: item.bankruptcyClosingStatementNeeded,
        bankruptcyReadyToPayTrustee: item.bankruptcyReadyToPayTrustee,
        bankruptcyAmountToTrustee: item.bankruptcyAmountToTrustee,
        bankruptcyAmountToAttorney: item.bankruptcyAmountToAttorney,
        bankruptcyAmountToClaimant: item.bankruptcyAmountToClaimant,

        unpaidMDL: item.unpaidMDL,
        unpaidCBF: item.unpaidCBF,
        unpaidAttyFees: item.unpaidAttyFees,
        unpaidAttyExpenses: item.unpaidAttyExpenses,
        unpaidLiens: item.unpaidLiens,
        unpaidARCHERFees: item.unpaidARCHERFees,
        unpaidOtherFees: item.unpaidOtherFees,
        unpaidOtherLiens: item.unpaidOtherLiens,

        isPositiveUnpaidMDL: item.isPositiveUnpaidMDL,
        isPositiveUnpaidCBF: item.isPositiveUnpaidCBF,
        isPositiveUnpaidAttyFees: item.isPositiveUnpaidAttyFees,
        isPositiveUnpaidAttyExpenses: item.isPositiveUnpaidAttyExpenses,
        isPositiveUnpaidLiens: item.isPositiveUnpaidLiens,
        isPositiveUnpaidARCHERFees: item.isPositiveUnpaidARCHERFees,
        isPositiveUnpaidOtherFees: item.isPositiveUnpaidOtherFees,
        isPositiveUnpaidOtherLiens: item.isPositiveUnpaidOtherLiens,

        ledgerCount: item.ledgerCount,
      };
    }

    return null;
  }
}
