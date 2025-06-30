import { QCStatusEnum } from '../enums/qcstatus-status.enum';
import { IdValue } from '../idValue';

export class BatchDetails {
  edpaName?: string;
  qcStatus: QCStatusEnum;
  sendActionDate?: Date;
  sentByUser?: IdValue;
  canBeSent: boolean;
}
