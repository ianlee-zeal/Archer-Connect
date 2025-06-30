import { ClaimSettlementLedger } from './closing-statement/claim-settlement-ledger';

export class ClaimantsWithLedgersGridRow {
  clientId: number;
  archerId: number;
  clientFirstName: string;
  clientLastName: string;
  primaryFirmName: string;
  disbursementGroupSequence?: number;
  disbursementGroupTypeName?: string;
  disbursementGroupName?: string;
  ledgerStageName?: string;
  fundedDate?: Date;
  backwardFromPrevStage?: boolean;

  static toModel(item: any): ClaimantsWithLedgersGridRow {
    if (!item) return null;

    const ledger = ClaimSettlementLedger.toModel(item);

    if (!ledger) return null;

    return {
      clientId: ledger.client?.id,
      archerId: ledger.archerId,
      clientFirstName: ledger.client?.firstName,
      clientLastName: ledger.client?.lastName,
      primaryFirmName: ledger.client?.org?.name,
      disbursementGroupSequence: ledger.disbursementGroup?.sequence,
      disbursementGroupTypeName: ledger.disbursementGroup?.typeName,
      disbursementGroupName: ledger.disbursementGroup?.name,
      ledgerStageName: ledger.stage?.name,
      fundedDate: ledger.client?.fundedDate,
      backwardFromPrevStage: ledger.backwardFromPrevStage,
    };
  }
}
