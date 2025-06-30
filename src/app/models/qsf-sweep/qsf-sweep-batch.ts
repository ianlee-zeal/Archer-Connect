import { QSFLienSweepStatus } from '../enums/qsf-lien-sweep-status.enum';

export interface QSFSweepBatch {
  id: number;
  jobId: number;

  reportDocId: number;
  caseId: number;
  statusId: QSFLienSweepStatus;
  channelName?: string;
  createdDate: Date;
  availableForCommit: boolean;
}
