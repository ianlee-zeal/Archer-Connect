import { IdValue } from '..';
import { Auditable } from '../auditable';
import { DocumentTemplate } from '../documents/document-generators';
import { EntityTypeEnum } from '../enums';

export class ClaimSettlementLedgerSettings extends Auditable {
  id: number;
  entityId: number;
  entityTypeId: EntityTypeEnum;
  productId: number;
  netAllocationThreshold: number;
  lienPaymentsOrganization: IdValue;
  lienPaymentsOrgId: number;
  isDefaultLienPaymentsOrganization: boolean;
  formulaSetId: number;
  formulaModeId: number;
  formulaVersion: number | null;
  closingStatementTemplateId: number | null;
  firmApprovedTemplate: boolean;
  electionFormRequired: boolean;
  closingStatementEnabledPostal: boolean;
  closingStatementElectronicDeliveryEnabled: boolean;
  closingStatementElectronicDeliveryProviderId: number | null;
  settlementCounselPaymentOrgTypeId: number;
  primaryFirmPaymentOrgTypeId: number;
  referingFirmPaymentOrgTypeId: number;
  specialInstructions: string;
  defenseApprovalRequired: boolean;
  multipleRoundsOfFunding: boolean;
  isDigitalPaymentsEnabled: boolean;
  digitalPaymentProviderId?: number;
  exportDetailedDisbursementWorksheetTemplateId?: number;
  exportFirmFeeAndExpenseTemplateId?: number;
  enableLienTransfers: boolean;
  isManualPaymentRequestsAllowed: boolean;
  isFeeAutomationEnabled: boolean;
  isClosingStatementAutomationEnabled: boolean;
  isPaymentAutomationEnabled: boolean;
  isLienImportAutomationEnabled: boolean;
  isLienImportAutomationPermissionEnabled: boolean;

  exportDetailedDisbursementWorksheetTemplate?: DocumentTemplate;
  exportFirmFeeAndExpenseTemplate?: DocumentTemplate;

  public static toModel(item: any): ClaimSettlementLedgerSettings {
    if (item) {
      return {
        ...super.toModel(item),
        lienPaymentsOrganization: item.lienPaymentsOrganization,
        isDefaultLienPaymentsOrganization: item.isDefaultLienPaymentsOrganization,
        lienPaymentsOrgId: item.lienPaymentsOrganization?.id,
        id: item.id,
        entityId: item.entityId,
        entityTypeId: item.entityTypeId,
        productId: item.productId,
        netAllocationThreshold: item.netAllocationThreshold,
        formulaSetId: item.formulaSetId,
        formulaModeId: item.formulaModeId,
        formulaVersion: item.formulaVersion,
        closingStatementTemplateId: item.closingStatementTemplateId,
        firmApprovedTemplate: item.firmApprovedTemplate,
        electionFormRequired: item.electionFormRequired,
        closingStatementEnabledPostal: item.closingStatementEnabledPostal,
        closingStatementElectronicDeliveryEnabled: item.closingStatementElectronicDeliveryEnabled,
        closingStatementElectronicDeliveryProviderId: item.closingStatementElectronicDeliveryProviderId,
        settlementCounselPaymentOrgTypeId: item.settlementCounselPaymentOrgTypeId,
        primaryFirmPaymentOrgTypeId: item.primaryFirmPaymentOrgTypeId,
        referingFirmPaymentOrgTypeId: item.referingFirmPaymentOrgTypeId,
        specialInstructions: item.specialInstructions,
        defenseApprovalRequired: item.defenseApprovalRequired,
        multipleRoundsOfFunding: item.multipleRoundsOfFunding,
        isDigitalPaymentsEnabled: item.isDigitalPaymentsEnabled,
        digitalPaymentProviderId: item.digitalPaymentProviderId,
        exportDetailedDisbursementWorksheetTemplateId: item.exportDetailedDisbursementWorksheetTemplateId,
        exportFirmFeeAndExpenseTemplateId: item.exportFirmFeeAndExpenseTemplateId,
        exportDetailedDisbursementWorksheetTemplate: item.exportDetailedDisbursementWorksheetTemplate,
        exportFirmFeeAndExpenseTemplate: item.exportFirmFeeAndExpenseTemplate,
        enableLienTransfers: item.enableLienTransfers,
        isManualPaymentRequestsAllowed: item.isManualPaymentRequestsAllowed,
        isFeeAutomationEnabled: item.isFeeAutomationEnabled,
        isClosingStatementAutomationEnabled: item.isClosingStatementAutomationEnabled,
        isPaymentAutomationEnabled: item.isPaymentAutomationEnabled,
        isLienImportAutomationEnabled: item.isLienImportAutomationEnabled,
        isLienImportAutomationPermissionEnabled: item.isLienImportAutomationPermissionEnabled,
      };
    }

    return null;
  }
}
