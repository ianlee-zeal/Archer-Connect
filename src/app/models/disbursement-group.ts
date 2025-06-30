import { DateHelper } from '@app/helpers/date.helper';
// eslint-disable-next-line import/no-cycle
import { Auditable } from './auditable';

export class DisbursementGroup extends Auditable {
  id: number;
  name: string;
  typeName: string;
  typeId: number;
  stageName: string;
  stageId: number;
  deficiencyTypeTemplateId: number;
  claimantCount: number;
  totalAmount: number;
  projectId: number;
  defenseApprovedDate: Date;
  followUpDate: Date;
  settlementApprovedDate: Date;
  archerApprovedDate: Date;
  sequence: number;
  isActive: boolean;
  isPaymentEnabled: boolean;
  electionFormRequired: boolean | null;
  netAllocation: number;
  isPrimaryFirmApprovalRequiredForPayment: boolean | null;

  public static toModel(item): DisbursementGroup {
    if (!item) {
      return null;
    }

    return {
      id: item.id,
      name: item.name,
      typeName: item.typeName,
      typeId: item.disbursementGroupTypeId,
      stageName: item.stageName,
      stageId: item.stageId,
      deficiencyTypeTemplateId: item.deficiencyTypeTemplateId,
      claimantCount: item.claimantCount,
      defenseApprovedDate: DateHelper.toLocalDateWithoutTime(item.defenseApprovedDate),
      followUpDate: DateHelper.toLocalDateWithoutTime(item.followUpDate),
      totalAmount: item.totalAmount,
      projectId: item.caseId,
      settlementApprovedDate: DateHelper.toLocalDateWithoutTime(item.settlementApprovedDate),
      archerApprovedDate: DateHelper.toLocalDateWithoutTime(item.archerApprovedDate),
      sequence: item.sequence,
      isActive: item.isActive,
      isPaymentEnabled: item.paymentEnabled,
      electionFormRequired: item.electionFormRequired,
      ...super.toModel(item),
      createdDate: DateHelper.toLocalDateWithoutTime(item.createdDate),
      netAllocation: item.netAllocation,
      isPrimaryFirmApprovalRequiredForPayment: item.isPrimaryFirmApprovalRequiredForPayment,
    };
  }

  public static toDto(item): any {
    if (!item) {
      return null;
    }

    return {
      id: item.id,
      name: item.name,
      disbursementGroupTypeId: item.typeId,
      stageId: item.stageId,
      deficiencyTypeTemplateId: item.deficiencyTypeTemplateId,
      caseId: item.projectId,
      defenseApprovedDate: DateHelper.toStringWithoutTime(item.defenseApprovedDate),
      followUpDate: DateHelper.toStringWithoutTime(item.followUpDate),
      settlementApprovedDate: DateHelper.toStringWithoutTime(item.settlementApprovedDate),
      archerApprovedDate: DateHelper.toStringWithoutTime(item.archerApprovedDate),
      sequence: item.sequence,
      isActive: item.isActive,
      paymentEnabled: item.isPaymentEnabled,
      electionFormRequired: item.electionFormRequired,
      isPrimaryFirmApprovalRequiredForPayment: item.isPrimaryFirmApprovalRequiredForPayment,    };
  }
}
