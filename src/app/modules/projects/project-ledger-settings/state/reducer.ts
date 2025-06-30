import { createReducer, on, Action } from '@ngrx/store';
import { IdValue, Project } from '@app/models';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { ClaimSettlementLedgerSettings } from '@app/models/ledger-settings/claim-settlement-ledger-settings';
import { FormulaSets } from '@app/models/formula/formula-sets';
import { SelectHelper } from '@app/helpers/select.helper';
import { SelectGroupsEnum } from '@app/models/enums/select-groups.enum';
import * as actions from './actions';
import { FileImportTemplateTypes } from '@app/models/enums';
import { DocumentTemplate } from '@app/models/documents/document-generators';

export interface LedgerSettingsState {
  project: Project,
  rowNo: number,
  error: string,
  templateTypes: number[],
  isLoadDataComplete: boolean,
  data: {
    claimSettlementLedgerSettings: ClaimSettlementLedgerSettings
  }

  commonSettings: {
    qsfProductOptions: SelectOption[];

    currentData: {
      netAllocationThreshold: number;
      qsfProductId: number;
      isQsfServiceChanged: boolean;
      lienPaymentsOrganization: IdValue;
      isDefaultLienPaymentsOrganization: boolean;
      defenseApprovalRequired: boolean;
      multipleRoundsOfFunding: boolean;
      enableLienTransfers: boolean;
      isManualPaymentRequestsAllowed: boolean;
      isFeeAutomationEnabled: boolean;
      isClosingStatementAutomationEnabled: boolean;
      isPaymentAutomationEnabled: boolean;
      isLienImportAutomationEnabled: boolean;
      isLienImportAutomationPermissionEnabled: boolean;
    }
  }

  formulaSettings: {
    formulaSetIdOptions: SelectOption[],
    formulaSettingsCalculationStepOptions: SelectOption[],
    formulaModeIdOptions: SelectOption[],

    data: {
      formulaSetFormulas: FormulaSets[],
    },
    currentData: {
      formulaSetId: number;
      formulaModeId: number;
      formulaVersion: number | null;
    }
  },

  closingStatementSettings: {
    data: {
      closingStatementTemplateOptions: SelectOption[],
      importFeeAndExpenseTemplateOptions: SelectOption[],
      importDisbursementWorksheetTemplateOptions: SelectOption[],
    },
    currentData: {
      closingStatementTemplateId: number,
      firmApprovedTemplate: boolean,
      exportDetailedDisbursementWorksheetTemplateId: number,
      exportFirmFeeAndExpenseTemplateId: number,
      exportFirmFeeAndExpenseTemplate: DocumentTemplate,
      exportDetailedDisbursementWorksheetTemplate: DocumentTemplate,
    },

  },

  deliverySettings: {
    electronicDeliveryProviderOptions: SelectOption[]
    currentData: {
      electionFormRequired: boolean;
      closingStatementEnabledPostal: boolean;
      closingStatementElectronicDeliveryEnabled: boolean;
      closingStatementElectronicDeliveryProviderId: number | null;
    },
  },

  digitalPaymentSettings: {
    digitalPaymentProvidersOptions: SelectOption[]
    currentData: {
      isDigitalPaymentsEnabled: boolean;
      digitalPaymentProviderId: number | null;
    },
  },

  firmMoneyMovement: {
    firmMoneyMovementOptions: SelectOption[],

    currentData: {
      settlementCounselPaymentOrgTypeId: number,
      primaryFirmPaymentOrgTypeId: number,
      referingFirmPaymentOrgTypeId: number,
      specialInstructions: string,
    },
  },
}

export const claimantSettlementLedgerSettingsInitialState: LedgerSettingsState = {
  project: null,
  rowNo: null,
  error: null,
  templateTypes: null,
  isLoadDataComplete: false,
  data: { claimSettlementLedgerSettings: null },
  commonSettings: {
    qsfProductOptions: null,

    currentData: {
      netAllocationThreshold: 0,
      qsfProductId: null,
      isQsfServiceChanged: false,
      lienPaymentsOrganization: null,
      isDefaultLienPaymentsOrganization: null,
      defenseApprovalRequired: null,
      multipleRoundsOfFunding: null,
      enableLienTransfers: null,
      isManualPaymentRequestsAllowed: null,
      isFeeAutomationEnabled: null,
      isClosingStatementAutomationEnabled: null,
      isPaymentAutomationEnabled: null,
      isLienImportAutomationEnabled: null,
      isLienImportAutomationPermissionEnabled: null,
    },
  },

  formulaSettings: {
    formulaSetIdOptions: null,
    formulaSettingsCalculationStepOptions: null,
    formulaModeIdOptions: null,

    data: { formulaSetFormulas: null },
    currentData: {
      formulaSetId: null,
      formulaModeId: null,
      formulaVersion: null,
    },
  },

  closingStatementSettings: {
    data: {
      closingStatementTemplateOptions: null,
      importFeeAndExpenseTemplateOptions: null,
      importDisbursementWorksheetTemplateOptions: null,
    },
    currentData: {
      closingStatementTemplateId: null,
      firmApprovedTemplate: null,
      exportDetailedDisbursementWorksheetTemplateId: null,
      exportFirmFeeAndExpenseTemplateId: null,
      exportFirmFeeAndExpenseTemplate: null,
      exportDetailedDisbursementWorksheetTemplate: null,
    },
  },

  deliverySettings: {
    electronicDeliveryProviderOptions: null,
    currentData: {
      electionFormRequired: null,
      closingStatementEnabledPostal: null,
      closingStatementElectronicDeliveryEnabled: null,
      closingStatementElectronicDeliveryProviderId: null,
    },
  },

  digitalPaymentSettings: {
    digitalPaymentProvidersOptions: null,
    currentData: {
      isDigitalPaymentsEnabled: null,
      digitalPaymentProviderId: null,
    },
  },

  firmMoneyMovement: {
    firmMoneyMovementOptions: null,

    currentData: {
      settlementCounselPaymentOrgTypeId: null,
      primaryFirmPaymentOrgTypeId: null,
      referingFirmPaymentOrgTypeId: null,
      specialInstructions: null,
    },
  },
};

export const claimSettlementLedgerSettingsReducer = createReducer(
  claimantSettlementLedgerSettingsInitialState,
  on(actions.LoadData, (state: LedgerSettingsState) => ({ ...state })),

  on(actions.LoadDataComplete, (
    state: LedgerSettingsState,
    // eslint-disable-next-line @typescript-eslint/typedef
    { claimSettlementLedgerSettings, documentImportTemplates, formulaSets, electronicDeliveryProviders, qsfProducts, closingStatementTemplates, formulaModes, firmMoneyMovementOptions, digitalPaymentProvidersOptions },
  ) => ({
    ...state,
    data: {
      ...state.data,
      claimSettlementLedgerSettings,
    },
    isLoadDataComplete: true,
    rowNo: claimSettlementLedgerSettings?.id,
    commonSettings: {
      ...state.commonSettings,
      qsfProductOptions: qsfProducts,
      currentData: {
        ...state.commonSettings.currentData,
        netAllocationThreshold: claimSettlementLedgerSettings?.netAllocationThreshold ?? 0,
        qsfProductId: claimSettlementLedgerSettings?.productId ?? qsfProducts[0]?.id,
        lienPaymentsOrganization: claimSettlementLedgerSettings?.lienPaymentsOrganization,
        isDefaultLienPaymentsOrganization: claimSettlementLedgerSettings?.isDefaultLienPaymentsOrganization,
        defenseApprovalRequired: claimSettlementLedgerSettings?.defenseApprovalRequired,
        multipleRoundsOfFunding: claimSettlementLedgerSettings?.multipleRoundsOfFunding,
        enableLienTransfers: claimSettlementLedgerSettings?.enableLienTransfers,
        isManualPaymentRequestsAllowed: claimSettlementLedgerSettings?.isManualPaymentRequestsAllowed,
        isFeeAutomationEnabled: claimSettlementLedgerSettings?.isFeeAutomationEnabled,
        isClosingStatementAutomationEnabled: claimSettlementLedgerSettings?.isClosingStatementAutomationEnabled,
        isPaymentAutomationEnabled: claimSettlementLedgerSettings?.isPaymentAutomationEnabled,
        isLienImportAutomationEnabled: claimSettlementLedgerSettings?.isLienImportAutomationEnabled,
        isLienImportAutomationPermissionEnabled: claimSettlementLedgerSettings?.isLienImportAutomationPermissionEnabled,
      },
    },

    closingStatementSettings: {
      ...state.closingStatementSettings,
      currentData: {
        ...state.closingStatementSettings.currentData,
        exportDetailedDisbursementWorksheetTemplateId: claimSettlementLedgerSettings?.exportDetailedDisbursementWorksheetTemplateId ?? null,
        exportDetailedDisbursementWorksheetTemplate: claimSettlementLedgerSettings?.exportDetailedDisbursementWorksheetTemplate ?? null,
        exportFirmFeeAndExpenseTemplateId: claimSettlementLedgerSettings?.exportFirmFeeAndExpenseTemplateId ?? null,
        exportFirmFeeAndExpenseTemplate: claimSettlementLedgerSettings?.exportFirmFeeAndExpenseTemplate ?? null,
        firmApprovedTemplate: claimSettlementLedgerSettings?.firmApprovedTemplate ?? false,
        closingStatementTemplateId: claimSettlementLedgerSettings?.closingStatementTemplateId ?? null,
      },
      data: {
        closingStatementTemplateOptions: closingStatementTemplates?.map(item => SelectHelper.toGroupedOption(item, item?.isGlobal ? SelectGroupsEnum.GlobalTemplates : SelectGroupsEnum.ProjectSpecificTemplates)),
        importDisbursementWorksheetTemplateOptions: SelectHelper.toOptions(documentImportTemplates[FileImportTemplateTypes.NewDetailedDisbursementWorksheet]),
        importFeeAndExpenseTemplateOptions: SelectHelper.toOptions(documentImportTemplates[FileImportTemplateTypes.FirmFeeAndExpense]),
      },
    },

    formulaSettings: {
      ...state.formulaSettings,
      currentData: {
        ...state.formulaSettings.currentData,
        formulaSetId: claimSettlementLedgerSettings?.formulaSetId ?? formulaSets[0]?.id,
        formulaModeId: claimSettlementLedgerSettings?.formulaModeId ?? formulaModes[0]?.id,
        formulaVersion: claimSettlementLedgerSettings?.formulaVersion,
      },
      data: { formulaSetFormulas: formulaSets },
      formulaSetIdOptions: formulaSets?.map(item => {
        const opt: SelectOption = {
          id: item.id,
          name: item.name,
        };
        return opt;
      }),
      formulaModeIdOptions: formulaModes,
    },

    deliverySettings: {
      ...state.deliverySettings,
      electronicDeliveryProviderOptions: electronicDeliveryProviders,
      currentData: {
        ...state.deliverySettings.currentData,
        electionFormRequired: claimSettlementLedgerSettings?.electionFormRequired ?? false,
        closingStatementEnabledPostal: claimSettlementLedgerSettings?.closingStatementEnabledPostal ?? false,
        closingStatementElectronicDeliveryEnabled: claimSettlementLedgerSettings?.closingStatementElectronicDeliveryEnabled ?? false,
        closingStatementElectronicDeliveryProviderId: claimSettlementLedgerSettings?.closingStatementElectronicDeliveryProviderId ?? null,
      },
    },

    digitalPaymentSettings: {
      ...state.digitalPaymentSettings,
      digitalPaymentProvidersOptions,
      currentData: {
        ...state.digitalPaymentSettings.currentData,
        isDigitalPaymentsEnabled: claimSettlementLedgerSettings?.isDigitalPaymentsEnabled ?? false,
        digitalPaymentProviderId: claimSettlementLedgerSettings?.digitalPaymentProviderId ?? null,
      },
    },

    firmMoneyMovement: {
      ...state.firmMoneyMovement,
      firmMoneyMovementOptions,

      currentData: {
        ...state.firmMoneyMovement.currentData,
        settlementCounselPaymentOrgTypeId: claimSettlementLedgerSettings?.settlementCounselPaymentOrgTypeId,
        primaryFirmPaymentOrgTypeId: claimSettlementLedgerSettings?.primaryFirmPaymentOrgTypeId,
        referingFirmPaymentOrgTypeId: claimSettlementLedgerSettings?.referingFirmPaymentOrgTypeId,
        specialInstructions: claimSettlementLedgerSettings?.specialInstructions,
      },
    },

  })),

  on(actions.updateClosingStatementSettingsCurrentData, (state, { closingStatementTemplateId, firmApprovedTemplate, exportDetailedDisbursementWorksheetTemplateId, exportFirmFeeAndExpenseTemplateId }) => ({
    ...state,
    closingStatementSettings: {
      ...state.closingStatementSettings,
      currentData: {
        ...state.closingStatementSettings.currentData,
        closingStatementTemplateId,
        firmApprovedTemplate,
        exportDetailedDisbursementWorksheetTemplateId,
        exportFirmFeeAndExpenseTemplateId,
      },
    },
  })),

  on(actions.setDefaultDeliverySettings, (state, { electronicDeliveryProviderOptions }) => ({
    ...state,
    deliverySettings: {
      ...state.deliverySettings,
      electronicDeliveryProviderOptions,
    },
  })),

  on(actions.updateDeliverySettingsCurrentData, (state, { electionFormRequired, closingStatementEnabledPostal, closingStatementElectronicDeliveryEnabled, closingStatementElectronicDeliveryProviderId }) => ({
    ...state,
    deliverySettings: {
      ...state.deliverySettings,
      currentData: {
        ...state.deliverySettings.currentData,
        electionFormRequired,
        closingStatementEnabledPostal,
        closingStatementElectronicDeliveryEnabled,
        closingStatementElectronicDeliveryProviderId,
      },
    },
  })),

  on(actions.setDefaultDigitalPaymentsSettings, (state: LedgerSettingsState, { digitalPaymentProvidersOptions }) => ({
    ...state,
    digitalPaymentSettings: {
      ...state.digitalPaymentSettings,
      digitalPaymentProvidersOptions,
    },
  })),

  on(actions.updateDigitalPaymentsSettingsCurrentData, (state: LedgerSettingsState, { isDigitalPaymentsEnabled, digitalPaymentProviderId }) => ({
    ...state,
    digitalPaymentSettings: {
      ...state.digitalPaymentSettings,
      currentData: {
        ...state.digitalPaymentSettings.currentData,
        isDigitalPaymentsEnabled,
        digitalPaymentProviderId,
      },
    },
  })),

  on(actions.updateFormulaSettingsCurrentData, (state, { formulaSetId, formulaModeId }) => ({
    ...state,
    formulaSettings: {
      ...state.formulaSettings,
      currentData: {
        ...state.formulaSettings.currentData,
        formulaSetId,
        formulaModeId,
      },
    },
  })),

  on(actions.filterFormulaCalculationStepOptions, (state, { formulaSetId }) => ({
    ...state,
    formulaSettings: {
      ...state.formulaSettings,
      currentData: {
        ...state.formulaSettings.currentData,
        formulaSetId,
      },
      formulaSettingsCalculationStepOptions: (state.formulaSettings.data.formulaSetFormulas.filter(fsf => fsf.id === formulaSetId).length > 0)
        ? state.formulaSettings.data.formulaSetFormulas.filter(fsf => fsf.id === formulaSetId)[0].formulaSetFormulas?.map(item => {
          const opt: SelectOption = {
            id: item.formula.id,
            name: item.formula.description,
          };
          return opt;
        })
        : null,
    },
  })),

  on(actions.updateCommonSettingsCurrentData, (state, { currentData }) => ({
    ...state,
    commonSettings: {
      ...state.commonSettings,
      currentData: {
        ...state.commonSettings.currentData,
        netAllocationThreshold: currentData.netAllocationThreshold,
        lienPaymentsOrganization: currentData.lienPaymentsOrganization,
        qsfProductId: currentData.qsfProductId,
        isQsfServiceChanged: currentData.isQsfServiceChanged,
        defenseApprovalRequired: currentData.defenseApprovalRequired,
        multipleRoundsOfFunding: currentData.multipleRoundsOfFunding,
        enableLienTransfers: currentData.enableLienTransfers,
        isManualPaymentRequestsAllowed: currentData.isManualPaymentRequestsAllowed,
        isFeeAutomationEnabled: currentData.isFeeAutomationEnabled,
        isClosingStatementAutomationEnabled: currentData.isClosingStatementAutomationEnabled,
        isPaymentAutomationEnabled: currentData.isPaymentAutomationEnabled,
        isLienImportAutomationEnabled: currentData.isLienImportAutomationEnabled,
      },
    },
  })),

  on(actions.updateFirmMoneyMovementCurrentData, (state, { firmMoneyMovementValues }) => ({
    ...state,
    firmMoneyMovement: {
      ...state.firmMoneyMovement,

      currentData: {
        ...state.firmMoneyMovement.currentData,
        settlementCounselPaymentOrgTypeId: firmMoneyMovementValues.settlementCounselPayments,
        primaryFirmPaymentOrgTypeId: firmMoneyMovementValues.primaryFirmPayments,
        referingFirmPaymentOrgTypeId: firmMoneyMovementValues.referingFirmPayments,
        specialInstructions: firmMoneyMovementValues.specialInstructions,
      },
    },
  })),

  on(actions.clearCurrentData, state => ({
    ...state,
    isLoadDataComplete: false,
    formulaSettings: {
      ...state.formulaSettings,

      currentData: {
        ...state.formulaSettings.currentData,
        formulaSetId: null,
        formulaModeId: null,
        formulaVersion: null,
      },
    },
    firmMoneyMovement: {
      ...state.firmMoneyMovement,

      currentData: {
        ...state.firmMoneyMovement.currentData,
        settlementCounselPaymentOrgTypeId: null,
        primaryFirmPaymentOrgTypeId: null,
        referingFirmPaymentOrgTypeId: null,
        specialInstructions: null,
      },
    },
    closingStatementSettings: {
      ...state.closingStatementSettings,

      currentData: {
        ...state.closingStatementSettings.currentData,
        closingStatementTemplateId: null,
        firmApprovedTemplate: null,
        exportDetailedDisbursementWorksheetTemplateId: null,
        exportFirmFeeAndExpenseTemplateId: null,
        exportFirmFeeAndExpenseTemplate: null,
        exportDetailedDisbursementWorksheetTemplate: null,
      },
    },
  })),

  on(actions.CreateOrUpdateLedgerSettingsComplete, (state, { claimSettlementLedgerSettings }) => ({
    ...state,
    data: { claimSettlementLedgerSettings },
  })),

  on(actions.LoadOnlyClosingStatementSettingsComplete, (
    state: LedgerSettingsState,
    // eslint-disable-next-line @typescript-eslint/typedef
    { claimSettlementLedgerSettings },
  ) => ({
    ...state,
    data: {
      ...state.data,
      claimSettlementLedgerSettings,
    },
    isLoadDataComplete: true,
    rowNo: claimSettlementLedgerSettings?.id,
    commonSettings: {
      ...state.commonSettings,
      currentData: {
        ...state.commonSettings.currentData,
        netAllocationThreshold: claimSettlementLedgerSettings?.netAllocationThreshold ?? 0,
        qsfProductId: claimSettlementLedgerSettings?.productId ?? (state.commonSettings.qsfProductOptions[0]?.id as number),
        lienPaymentsOrganization: claimSettlementLedgerSettings?.lienPaymentsOrganization,
        isDefaultLienPaymentsOrganization: claimSettlementLedgerSettings?.isDefaultLienPaymentsOrganization,
        defenseApprovalRequired: claimSettlementLedgerSettings?.defenseApprovalRequired,
        multipleRoundsOfFunding: claimSettlementLedgerSettings?.multipleRoundsOfFunding,
        enableLienTransfers: claimSettlementLedgerSettings?.enableLienTransfers,
        isManualPaymentRequestsAllowed: claimSettlementLedgerSettings?.isManualPaymentRequestsAllowed,
        isFeeAutomationEnabled: claimSettlementLedgerSettings?.isFeeAutomationEnabled,
        isClosingStatementAutomationEnabled: claimSettlementLedgerSettings?.isClosingStatementAutomationEnabled,
        isPaymentAutomationEnabled: claimSettlementLedgerSettings?.isPaymentAutomationEnabled,
        isLienImportAutomationEnabled: claimSettlementLedgerSettings?.isLienImportAutomationEnabled,
        isLienImportAutomationPermissionEnabled: claimSettlementLedgerSettings?.isLienImportAutomationPermissionEnabled,
      },
    },

    closingStatementSettings: {
      ...state.closingStatementSettings,
      currentData: {
        ...state.closingStatementSettings.currentData,
        exportDetailedDisbursementWorksheetTemplateId: claimSettlementLedgerSettings?.exportDetailedDisbursementWorksheetTemplateId ?? null,
        exportDetailedDisbursementWorksheetTemplate: claimSettlementLedgerSettings?.exportDetailedDisbursementWorksheetTemplate ?? null,
        exportFirmFeeAndExpenseTemplateId: claimSettlementLedgerSettings?.exportFirmFeeAndExpenseTemplateId ?? null,
        exportFirmFeeAndExpenseTemplate: claimSettlementLedgerSettings?.exportFirmFeeAndExpenseTemplate ?? null,
        firmApprovedTemplate: claimSettlementLedgerSettings?.firmApprovedTemplate ?? false,
        closingStatementTemplateId: claimSettlementLedgerSettings?.closingStatementTemplateId ?? null,
      },
    },

    formulaSettings: {
      ...state.formulaSettings,
      currentData: {
        ...state.formulaSettings.currentData,
        formulaSetId: claimSettlementLedgerSettings?.formulaSetId ?? (state.formulaSettings.formulaSetIdOptions[0]?.id as number),
        formulaModeId: claimSettlementLedgerSettings?.formulaModeId ?? (state.formulaSettings.formulaModeIdOptions[0]?.id as number),
        formulaVersion: claimSettlementLedgerSettings?.formulaVersion,
      },
    },

    deliverySettings: {
      ...state.deliverySettings,
      currentData: {
        ...state.deliverySettings.currentData,
        electionFormRequired: claimSettlementLedgerSettings?.electionFormRequired ?? false,
        closingStatementEnabledPostal: claimSettlementLedgerSettings?.closingStatementEnabledPostal ?? false,
        closingStatementElectronicDeliveryEnabled: claimSettlementLedgerSettings?.closingStatementElectronicDeliveryEnabled ?? false,
        closingStatementElectronicDeliveryProviderId: claimSettlementLedgerSettings?.closingStatementElectronicDeliveryProviderId ?? null,
      },
    },

    digitalPaymentSettings: {
      ...state.digitalPaymentSettings,
      currentData: {
        ...state.digitalPaymentSettings.currentData,
        isDigitalPaymentsEnabled: claimSettlementLedgerSettings?.isDigitalPaymentsEnabled ?? false,
        digitalPaymentProviderId: claimSettlementLedgerSettings?.digitalPaymentProviderId ?? null,
      },
    },

    firmMoneyMovement: {
      ...state.firmMoneyMovement,
      currentData: {
        ...state.firmMoneyMovement.currentData,
        settlementCounselPaymentOrgTypeId: claimSettlementLedgerSettings?.settlementCounselPaymentOrgTypeId,
        primaryFirmPaymentOrgTypeId: claimSettlementLedgerSettings?.primaryFirmPaymentOrgTypeId,
        referingFirmPaymentOrgTypeId: claimSettlementLedgerSettings?.referingFirmPaymentOrgTypeId,
        specialInstructions: claimSettlementLedgerSettings?.specialInstructions,
      },
    },

  })),

  on(actions.SetProject, (state, { projectObject }) => ({ ...state, project: projectObject })),
);

export function mainReducer(state: LedgerSettingsState | undefined, action: Action) {
  return claimSettlementLedgerSettingsReducer(state, action);
}
