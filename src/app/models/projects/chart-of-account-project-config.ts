/* eslint-disable max-classes-per-file */

export class ChartOfAccountProjectConfigDto {
  chartOfAccountId: number;
  active: boolean;
  displayName: string;
  includeInCostFirst: boolean;
  defaultPCT: number;
  defaultAmount: number;
  disbursementModeId: number;
  paymentEnabled: boolean;
  feePaymentSweep: boolean;
  isFeeAutomationEnabled: boolean;

  defaultModeId: number;
  required: boolean;
  defaultPayeeOrgId: number;
}

export class ChartOfAccountProjectConfig {
  chartOfAccountId: number;
  active: boolean;
  chartOfAccountAccountType: string;
  chartOfAccountAccountGroupNo: string;
  chartOfAccountAccountNo: string;
  chartOfAccountName: string;
  displayName: string;
  includeInCostFirst: boolean;
  chartOfAccountIsAccountGroup: boolean;
  chartOfAccountAccountModeVisible: boolean;
  chartOfAccountIncludeInCostVisible: boolean;
  chartOfAccountDefaultPCTVisible: boolean;
  chartOfAccountDefaultAmountVisible: boolean;
  chartOfAccountPaymentEnabledVisible: boolean;
  chartOfAccountPaymentModeVisible: boolean;
  chartOfAccountCollectorOrgVisible: boolean;
  chartOfAccountFeePaymentSweepVisible: boolean;
  chartOfAccountEnablePayeeEdit: boolean;
  chartOfAccountEnableCollectorEdit: boolean;
  projectId: number;
  defaultPCT: number;
  defaultAmount: number;
  disbursementModeId: number;
  paymentEnabled: boolean;
  defaultPayeeOrgEnabled: boolean;
  defaultModeId: number;
  chartOfAccountModeId: number;
  chartOfAccountModeName: string;
  chartOfAccountModechartOfAccountId: string;
  chartOfAccountModeDescription: string;
  chartOfAccountDisbursementModeId: number;
  chartOfAccountDisbursementModeName: string;
  chartOfAccountDisbursementModeDescription: string;
  required: boolean;
  defaultPayeeOrgId: number;
  defaultPayeeOrgName: string;
  feePaymentSweep: boolean;

  isAmountModeSelected?: boolean;

  isPaymentEnabledRequired?: boolean;
  chartOfAccountFeeImportAutomationVisible: boolean;
  isFeeAutomationEnabled: boolean;

  public static toModel(item): ChartOfAccountProjectConfig {
    if (!item) {
      return null;
    }
    return {
      chartOfAccountId: item.chartOfAccountId,
      active: item.active,
      chartOfAccountAccountType: item.chartOfAccountAccountType,
      chartOfAccountAccountGroupNo: item.chartOfAccountAccountGroupNo,
      chartOfAccountAccountNo: item.chartOfAccountAccountNo,
      chartOfAccountName: item.chartOfAccountName,
      displayName: item.displayName,
      includeInCostFirst: item.includeInCostFirst,
      chartOfAccountIsAccountGroup: item.chartOfAccountIsAccountGroup,
      chartOfAccountAccountModeVisible: item.chartOfAccountAccountModeVisible,
      chartOfAccountIncludeInCostVisible: item.chartOfAccountIncludeInCostVisible,
      chartOfAccountDefaultPCTVisible: item.chartOfAccountDefaultPCTVisible,
      chartOfAccountDefaultAmountVisible: item.chartOfAccountDefaultAmountVisible,
      chartOfAccountPaymentEnabledVisible: item.chartOfAccountPaymentEnabledVisible,
      chartOfAccountPaymentModeVisible: item.chartOfAccountPaymentModeVisible,
      chartOfAccountCollectorOrgVisible: item.chartOfAccountCollectorOrgVisible,
      chartOfAccountFeePaymentSweepVisible: item.chartOfAccountFeePaymentSweepVisible,
      chartOfAccountEnablePayeeEdit: item.chartOfAccountEnablePayeeEdit,
      chartOfAccountEnableCollectorEdit: item.chartOfAccountEnableCollectorEdit,
      projectId: item.caseId,
      defaultPCT: item.defaultPCT,
      defaultAmount: item.defaultAmount,
      disbursementModeId: item.disbursementModeId,
      paymentEnabled: item.paymentEnabled,
      defaultPayeeOrgEnabled: item.defaultPayeeOrgEnabled,
      defaultModeId: item.defaultModeId,
      chartOfAccountModeId: item.chartOfAccountModeId,
      chartOfAccountModeName: item.chartOfAccountModeName,
      chartOfAccountModechartOfAccountId: item.chartOfAccountModechartOfAccountId,
      chartOfAccountModeDescription: item.chartOfAccountModeDescription,
      chartOfAccountDisbursementModeId: item.chartOfAccountDisbursementModeId,
      chartOfAccountDisbursementModeName: item.chartOfAccountDisbursementModeName,
      chartOfAccountDisbursementModeDescription: item.chartOfAccountDisbursementModeDescription,
      required: item.required,
      defaultPayeeOrgId: item.defaultPayeeOrgId,
      defaultPayeeOrgName: item.defaultPayeeOrgName,
      isPaymentEnabledRequired: item.isPaymentEnabledRequired,
      feePaymentSweep: item.feePaymentSweep,
      isFeeAutomationEnabled : item.isFeeAutomationEnabled,
      chartOfAccountFeeImportAutomationVisible : item.chartOfAccountFeeImportAutomationVisible
    };
  }

  public static toDto(item: ChartOfAccountProjectConfig): ChartOfAccountProjectConfigDto {
    if (!item) {
      return null;
    }

    return {
      chartOfAccountId: item.chartOfAccountId,
      active: item.active,
      displayName: item.displayName,
      includeInCostFirst: item.includeInCostFirst,
      defaultPCT: item.defaultPCT,
      defaultAmount: item.defaultAmount,
      defaultModeId: item.defaultModeId,
      paymentEnabled: item.paymentEnabled,
      disbursementModeId: item.disbursementModeId,
      required: item.required,
      defaultPayeeOrgId: item.defaultPayeeOrgId,
      feePaymentSweep: item.feePaymentSweep,
      isFeeAutomationEnabled: item.isFeeAutomationEnabled
    };
  }
}
