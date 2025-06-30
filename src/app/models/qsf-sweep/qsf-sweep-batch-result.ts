export class QSFSweepBatchResult {
  batchId: number;
  clientId: number;
  firstName: string;
  lastName: string;
  financialOutcome: string;
  status: string;
  dgCount?: number;
  openDgCount?: number;
  categoryCode: string;
  ledgerLienStatus: string;
  lpmLienStatus: string;
  deltaLiensOnlySettlementAmount?: number;
  deltaLienHoldbackAmount?: number;
  deltaFeeHoldback?: number;
  deltaFinalLienAmount?: number;
  deltaLienFeeAmount?: number;
  deltaOtherFeesAmount?: number;
  deltaTotalFeesAmount?: number;
  bankruptcy: string;
  probate: string;
  error: string;
  committedDate?: Date;
}
