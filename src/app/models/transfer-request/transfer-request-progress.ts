import { TransferRequestProgressStatistics } from "./transfer-request-progress-statistics"

export class TransferRequestProgress {
  CurrentRow: number;
  TotalRows: number;
  Message: string;
  Statistics: TransferRequestProgressStatistics;
}
