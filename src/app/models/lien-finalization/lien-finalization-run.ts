import { Status } from '@app/models/status';
import { User } from '@app/models';
import { Org } from '..';

export class LienFinalizationRun {
  id: number;
  collectorOrg: Org;
  runStatusId: number;
  resultDocumentId: number;
  readyDocumentId: number;
  createdById: number;
  createdDate: Date;
  finalizedLienCount: number;
  nonFinalizedLienCount: number;
  selectedLienCount: number;

  runStatus: Status;
  createdBy: User;

  static toModel(item: LienFinalizationRun | any) : LienFinalizationRun | null {
    if (item) {
      return {
        ...item,
        createdDate: item.createdDate ? new Date(item.createdDate) : null,
        runStatus: item.runStatus ? Status.toModel(item.runStatus) : null,
        createdBy: item.createdBy ? User.toModel(item.createdBy) : null,
        collectorOrg: Org.toModel(item.collectorOrg),
      };
    }

    return null;
  }
}
