import { Stage } from './stage';

export class PaymentQueue {
  ledgerEntryId: number;
  projectId: number;
  projectName: string;
  archerId: number;
  clientId: number;
  attorneyReferenceId: string;
  claimantFirstName: string;
  claimantLastName: string;
  claimantStatus?: string;
  claimantStatusId?: number;
  accountGroupName: string;
  accountGroupNameWithNumber: string;
  accountName: string;
  accountNo: string;
  status: string;
  amount: number;
  disbursementGroupName: string;
  payeeName: string;
  splitTypeId: string;
  stage: Stage;
  claimSettlementLedgerId: number;
  assignedOrgName: string;
  assignedOrgRelation: string;
  transferToSubAccount: boolean;
  payeeOrgId: number;
  claimantNetDisbursed: boolean;
  netDisbursementDate?: Date;
  hasActiveChartOfAccount: boolean;
  clientPrimaryFirmId?: number;
  clientPrimaryFirmName: string;
  lienPaymentStageId?: number;
  lienPaymentStageName?: string;
  lienStatusId?: number;
  lienStatusName?: string;
  lienId?: number;
  bankruptcyStatusId?: number;
  bankruptcyStatusName?: string;
  bankruptcyStageId?: number;
  bankruptcyStageName?: string;
  abandoned?: boolean;
  amountToTrustee?: number;
  amountToAttorney?: number;
  amountToClaimant?: number;
  collectorName?: string;
  holdTypeReason?: string;
  overallInvoiceApprovalStatusId?: number;
  overallInvoiceApprovalStatusName?: string;
  createdDate: Date;
  arApprovalDate?: Date;
  qsfAdminApprovalDate?: Date;
  coaFeePaymentSweepEnabled?: boolean;
  disbursementGroupPaymentEnabled?: boolean;
  disbursementGroupStageId: number;
  disbursementGroupStageName: string;
  defenseApprovedDateIsSet: boolean;
  ledgerFirmApprovedStatusId?: number;
  ledgerFirmApprovedStatusName?: string;
  probateProductCategoryStatusId: number;
  probateProductCategoryStatusName: string;
  lienResolutionProductCategoryStatusId: number;
  lienResolutionProductCategoryStatusName: string;
  description: string;
  statusId: number;
  enableIndividualAuthorize: boolean;
  claimantFundedDate?: Date;

  constructor(model?: Partial<PaymentQueue>) {
    Object.assign(this, model);
  }

  public static toModel(item: PaymentQueue): PaymentQueue {
    if (!item) {
      return null;
    }

    return {
      accountGroupName: item.accountGroupName,
      accountName: item.accountName,
      amount: item.amount,
      claimantFirstName: item.claimantFirstName,
      claimantLastName: item.claimantLastName,
      claimantStatus : item.claimantStatus,
      claimantStatusId : item.claimantStatusId,
      archerId: item.archerId,
      clientId: item.clientId,
      attorneyReferenceId: item.attorneyReferenceId,
      disbursementGroupName: item.disbursementGroupName,
      ledgerEntryId: item.ledgerEntryId,
      payeeName: item.payeeName,
      projectId: item.projectId,
      projectName: item.projectName,
      splitTypeId: item.splitTypeId,
      stage: item.stage,
      status: item.status,
      claimSettlementLedgerId: item.claimSettlementLedgerId,
      assignedOrgName: item.assignedOrgName,
      assignedOrgRelation: item.assignedOrgRelation,
      payeeOrgId: item.payeeOrgId,
      claimantNetDisbursed: item.claimantNetDisbursed,
      netDisbursementDate: item.netDisbursementDate,
      hasActiveChartOfAccount: item.hasActiveChartOfAccount,
      accountGroupNameWithNumber: item.accountGroupNameWithNumber,
      clientPrimaryFirmId: item.clientPrimaryFirmId,
      clientPrimaryFirmName: item.clientPrimaryFirmName,
      lienPaymentStageId: item.lienPaymentStageId,
      lienPaymentStageName: item.lienPaymentStageName,
      lienStatusId: item.lienStatusId,
      lienStatusName: item.lienStatusName,
      lienId: item.lienId,
      bankruptcyStatusId: item.bankruptcyStatusId,
      bankruptcyStatusName: item.bankruptcyStatusName,
      bankruptcyStageId: item.bankruptcyStageId,
      bankruptcyStageName: item.bankruptcyStageName,
      abandoned: item.abandoned,
      amountToTrustee: item.amountToTrustee,
      amountToAttorney: item.amountToAttorney,
      amountToClaimant: item.amountToClaimant,
      collectorName: item.collectorName,
      holdTypeReason: item.holdTypeReason,
      transferToSubAccount: item.transferToSubAccount,
      overallInvoiceApprovalStatusId: item.overallInvoiceApprovalStatusId,
      overallInvoiceApprovalStatusName: item.overallInvoiceApprovalStatusName,
      coaFeePaymentSweepEnabled: item.coaFeePaymentSweepEnabled,
      createdDate: item.createdDate,
      arApprovalDate: item.arApprovalDate,
      qsfAdminApprovalDate: item.qsfAdminApprovalDate,
      disbursementGroupPaymentEnabled: item.disbursementGroupPaymentEnabled,
      disbursementGroupStageId: item.disbursementGroupStageId,
      disbursementGroupStageName: item.disbursementGroupStageName,
      ledgerFirmApprovedStatusId: item.ledgerFirmApprovedStatusId,
      ledgerFirmApprovedStatusName: item.ledgerFirmApprovedStatusName,
      probateProductCategoryStatusId: item.probateProductCategoryStatusId,
      probateProductCategoryStatusName: item.probateProductCategoryStatusName,
      lienResolutionProductCategoryStatusId: item.lienResolutionProductCategoryStatusId,
      lienResolutionProductCategoryStatusName: item.lienResolutionProductCategoryStatusName,
      defenseApprovedDateIsSet: item.defenseApprovedDateIsSet,
      accountNo: item.accountNo,
      description: item.description,
      statusId: item.statusId,
      enableIndividualAuthorize: item.enableIndividualAuthorize,
      claimantFundedDate: item.claimantFundedDate,
    };
  }
}
