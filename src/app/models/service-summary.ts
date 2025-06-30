import { Status } from './status';

export class ServiceSummary {
  final?: boolean;
  finalDate?: Date;
  abandoned?: boolean;
  closingStatementNeeded: boolean | null;
  readyToPayTrustee: boolean | null;
  amountToTrustee: number | null;
  amountToAttorney: number | null;
  amountToClaimant: number | null;
  inGoodOrder?: boolean;
  deficiencyStatus: string;
  settlementPacketStatus: string;
  medicalLiensOverallStatus: string;
  qsfAdminOverallStatus: string;
  totalLiens: number;
  pendingLiens: number;
  finalizedProducts: number;
  attorneyFETotal: number | null;
  unpaidAttorneyFETotal: number | null;
  product: string;
  bankruptcyOverallStatus: string;
  releaseOverallStatus: string;
  probateOverallStatus: string;
  probateStatus: Status;
  bkFee: number | null;

  constructor(model?: Partial<ServiceSummary>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): ServiceSummary {
    if (item) {
      return {
        final: item.final,
        finalDate: item.finalDate,
        abandoned: item.abandoned,
        closingStatementNeeded: item.closingStatementNeeded,
        readyToPayTrustee: item.readyToPayTrustee,
        amountToTrustee: item.amountToTrustee,
        amountToAttorney: item.amountToAttorney,
        amountToClaimant: item.amountToClaimant,
        inGoodOrder: item.inGoodOrder,
        deficiencyStatus: item.deficiencyStatus,
        settlementPacketStatus: item.settlementPacketStatus,
        medicalLiensOverallStatus: item.medicalLiensOverallStatus,
        totalLiens: item.totalLiens,
        pendingLiens: item.pendingLiens,
        finalizedProducts: item.finalizedProducts,
        product: item.product,
        bankruptcyOverallStatus: item.bankruptcyOverallStatus,
        releaseOverallStatus: item.releaseOverallStatus,
        probateOverallStatus: item.probateOverallStatus,
        probateStatus: Status.toModel(item.probateStatus),
        qsfAdminOverallStatus: item.qsfAdminOverallStatus,
        attorneyFETotal: item.attorneyFETotal,
        unpaidAttorneyFETotal: item.unpaidAttorneyFETotal,
        bkFee: item.bkFee,
      };
    }
    return null;
  }
}
