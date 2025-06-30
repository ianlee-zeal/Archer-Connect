/* eslint-disable no-param-reassign */
import { LedgerAccountGroup as LedgerAccountGroupEnum } from '@app/models/enums';
import { CurrencyHelper } from '@app/helpers';
import { Auditable } from '../auditable';
import { LedgerAccountGroup } from './ledger-account-group';
import { IdValue } from '../idValue';
import { ClosingStatementInformation } from './closing-state-information';
import { ClaimSettlementLedger } from './claim-settlement-ledger';
import { LedgerEntry } from './ledger-entry';
import { FormulaEngineParams } from './formula-engine-params';
import { LedgerValues } from './ledger-values';

export class LedgerInfo extends Auditable {
  id: number;
  clientId: number;

  disbursementGroupId?: number;
  disbursementGroupName: string;
  disbursementGroupClaimantId?: number;
  disbursementGroupTypeId: number;

  firmApprovedStatusId?: number;
  firmApprovedStatusName: string;

  lienStatusFinalized: boolean;
  hasVariances: boolean;

  stageId: number;
  stageName: string;

  projectId: number;
  projectName: string;

  grossAllocation: number;
  feeExpenses: number;
  netAllocation: number;
  balance: number;

  contractFee: number;
  mdlFee: number;
  cbfFee: number;
  cbfFeeAmount: number;

  formulaSetId: number;
  formulaVersion: number;
  formulaMode: IdValue;
  product: IdValue;

  closingStatementInformation: ClosingStatementInformation;
  accountGroups: LedgerAccountGroup[];

  isElectronicDeliveryEnabled: boolean;

  lawFirmNote1: string;
  lawFirmNote2: string;

  settlementCounselPaymentOrgTypeId: number;
  referingFirmPaymentOrgTypeId: number;
  primaryFirmPaymentOrgTypeId: number;

  canChangeMDL: boolean;
  canChangeCBF: boolean;
  canChangeAttyFee: boolean;

  isAnyLedgerEntryAuthorized: boolean;

  processingAttorneyFeesLedgerEntriesExist: boolean;
  netAllocationThreshold: number;

  probateSPISyncedStatusId: number;
  probateSPISyncedStatusName: string;
  initialLedgerValues: LedgerValues;

  customCS1: string;
  customCS2: string;
  customCS3: string;
  customCS4: string;
  customCS5: string;

  orgAccessPairs: IdValue[];

  public static toModel(item: any): LedgerInfo {
    if (item) {
      return {
        ...super.toModel(item),
        id: item.id,
        clientId: item.clientId,

        disbursementGroupId: item.disbursementGroupId,
        disbursementGroupName: item.disbursementGroupName,
        disbursementGroupClaimantId: item.disbursementGroupClaimantId,
        disbursementGroupTypeId: item.disbursementGroupTypeId,

        firmApprovedStatusId: item.firmApprovedStatusId,
        firmApprovedStatusName: item.firmApprovedStatusName,
        lienStatusFinalized: item.lienStatusFinalized,
        hasVariances: item.hasVariances,

        stageId: item.stageId,
        stageName: item.stageName,

        projectId: item.projectId,
        projectName: item.projectName,

        grossAllocation: item.grossAllocation,
        feeExpenses: item.feeExpenses,
        netAllocation: item.netAllocation,
        balance: item.balance,

        contractFee: item.contractFee,
        mdlFee: item.mdlFee,
        cbfFee: item.cbfFee,
        cbfFeeAmount: item.cbfFeeAmount,
        formulaSetId: item.formulaSetId,
        formulaVersion: item.formulaVersion,
        formulaMode: item.formulaMode,
        product: item.product,
        closingStatementInformation: item.closingStatementInformation,

        accountGroups: item.accountGroups?.map((i: LedgerAccountGroup) => LedgerAccountGroup.toModel(i)),

        isElectronicDeliveryEnabled: item.isElectronicDeliveryEnabled,

        lawFirmNote1: item.note1,
        lawFirmNote2: item.note2,

        settlementCounselPaymentOrgTypeId: item.settlementCounselPaymentOrgTypeId,
        referingFirmPaymentOrgTypeId: item.referingFirmPaymentOrgTypeId,
        primaryFirmPaymentOrgTypeId: item.primaryFirmPaymentOrgTypeId,
        canChangeAttyFee: item.canChangeAttyFee,
        canChangeCBF: item.canChangeCBF,
        canChangeMDL: item.canChangeMDL,

        isAnyLedgerEntryAuthorized: item.isAnyLedgerEntryAuthorized,

        processingAttorneyFeesLedgerEntriesExist: item.processingAttorneyFeesLedgerEntriesExist,
        netAllocationThreshold: item.netAllocationThreshold,

        probateSPISyncedStatusId: item.probateSPISyncedStatusId,
        probateSPISyncedStatusName: item.probateSPISyncedStatusName,

        customCS1: item.customCS1,
        customCS2: item.customCS2,
        customCS3: item.customCS3,
        customCS4: item.customCS4,
        customCS5: item.customCS5,

        orgAccessPairs: item.orgAccessPairs,
        initialLedgerValues: item.initialLedgerValues,
      };
    }

    return null;
  }

  public static toClaimSettlementLedgerModel(item: LedgerInfo): ClaimSettlementLedger {
    if (item) {
      return <ClaimSettlementLedger>{
        // // disbursementGroup: item.disbursementGroupId,
        // // disbursementGroupClaimantId: item.disbursementGroupClaimantId,

        // // closingStatementInformation: item.closingStatementInformation,

        id: item.id,
        clientId: item.clientId,
        archerId: item.clientId, // Why we have different variables for same value?
        // client: Claimant.toModel(item.client),
        // stage: item.stage,

        stageId: item.stageId,
        projectId: item.projectId,
        firmApprovedStatusId: item.firmApprovedStatusId,
        // currentVersion: item.currentVersion,
        // deliveryDefault: item.deliveryDefault,
        // electronicDeliveryEnabled: item.electronicDeliveryEnabled,
        formulaSetId: item.formulaSetId,
        formulaVersion: item.formulaVersion,
        formulaMode: item.formulaMode.name,
        contractFeePct: item.contractFee / 100,
        mdlfeePct: item.mdlFee / 100,
        cbffeeAmount: item.cbfFeeAmount,
        cbffeePct: item.cbfFee / 100,
        // costFeeFirst: item.costFeeFirst,

        // disbursementGroup: DisbursementGroup.toModel(item.disbursementGroup),
        claimSettlementLedgerEntries: LedgerEntry.toFlatList(item.accountGroups),
      };
    }

    return null;
  }

  /**
   * Override Account Group total amount by formula result
   */
  public static updateFormulaTotalAmount(accGroup: LedgerAccountGroup, formulaResult: FormulaEngineParams): void {
    let accAmount = 0;

    switch (accGroup.accountGroupNo) {
      case LedgerAccountGroupEnum.AwardFunding:
        accAmount = formulaResult.grossAllocation;
        break;

      case LedgerAccountGroupEnum.MDL:
        accAmount = formulaResult.mdlTotal;
        break;

      case LedgerAccountGroupEnum.CommonBenefit:
        accAmount = formulaResult.cbfTotal;
        break;

      case LedgerAccountGroupEnum.AttyFees:
        accAmount = formulaResult.attorneyFeeTotal;
        break;

      case LedgerAccountGroupEnum.AttyExpenses:
        accAmount = formulaResult.attorneyExpensesTotal;
        break;

      case LedgerAccountGroupEnum.Liens:
        accAmount = formulaResult.lienTotal;
        break;

      case LedgerAccountGroupEnum.ARCHERFees:
        accAmount = formulaResult.archerFeeTotal;
        break;

      case LedgerAccountGroupEnum.OtherFees:
        accAmount = formulaResult.otherFeeTotal;
        break;

      case LedgerAccountGroupEnum.ThirdPartyPMTS:
        accAmount = formulaResult.thirdPartyPMTSTotal;
        break;

      case LedgerAccountGroupEnum.ClaimantDisbursements:
        accAmount = formulaResult.netAllocation;
        break;
    }

    accGroup.totalAmount = CurrencyHelper.round(accAmount);
  }
}
