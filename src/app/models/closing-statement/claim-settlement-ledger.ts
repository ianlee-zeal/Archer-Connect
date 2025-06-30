import { Claimant } from '../claimant';
import { DisbursementGroup } from '../disbursement-group';
import { IdValue } from '../idValue';
import { ClaimSettlementLedgerEntry } from './claim-settlement-ledger-entry';

export class ClaimSettlementLedger {
  id: number;
  clientId: number;
  archerId: number;
  client: Claimant;
  stage: IdValue;
  stageId: number;
  projectId: number;
  firmApprovedStatusId?: number;
  currentVersion: number;
  deliveryDefault: string;
  electronicDeliveryEnabled: boolean;
  formulaSetId: number;
  formulaVersion: number;
  formulaMode: string;
  contractFeePct: number;
  mdlfeePct: number;
  cbffeeAmount: number;
  cbffeePct: number;
  costFeeFirst: string;
  splitTypeId: number;
  backwardFromPrevStage: boolean;

  disbursementGroup: DisbursementGroup;
  claimSettlementLedgerEntries: ClaimSettlementLedgerEntry[];

  public static toModel(item: any): ClaimSettlementLedger {
    if (!item) {
      return null;
    }

    return {
      id: item.id,
      clientId: item.clientId,
      archerId: item.archerId,
      client: Claimant.toModel(item.client),
      stage: item.stage,
      stageId: item.stageId,
      projectId: item.projectId,
      firmApprovedStatusId: item.firmApprovedStatusId,
      currentVersion: item.currentVersion,
      deliveryDefault: item.deliveryDefault,
      electronicDeliveryEnabled: item.electronicDeliveryEnabled,
      formulaSetId: item.formulaSetId,
      formulaVersion: item.formulaVersion,
      formulaMode: item.formulaMode,
      contractFeePct: item.contractFeePct,
      mdlfeePct: item.mdlfeePct,
      cbffeeAmount: item.cbffeeAmount,
      cbffeePct: item.cbffeePct,
      costFeeFirst: item.costFeeFirst,
      splitTypeId: item.costFeeFirst,
      backwardFromPrevStage: item.backwardFromPrevStage,

      disbursementGroup: DisbursementGroup.toModel(item.disbursementGroup),
      claimSettlementLedgerEntries: item.claimSettlementLedgerEntries?.map(ClaimSettlementLedgerEntry.toModel) ?? [],
    };
  }
}
