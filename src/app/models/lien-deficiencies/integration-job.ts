import { Status } from '@app/models/status';
import { User } from '@app/models';

export class IntegrationJob {
  id: number;
  integrationId: number;
  statusId: number;
  resultDocumentId: number;
  createdDate: Date;

  status: Status;
  createdBy: User;

  static toModel(item: IntegrationJob | any) : IntegrationJob | null {
    if (item) {
      return {
        ...item,
        createdDate: item.createdDate ? new Date(item.createdDate) : null,
        status: item.status ? Status.toModel(item.status) : null,
        createdBy: item.createdBy ? User.toModel(item.createdBy) : null,
      };
    }

    return null;
  }
}
