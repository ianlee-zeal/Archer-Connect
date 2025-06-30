import { DateHelper } from '@app/helpers/date.helper';
import { User } from './user';

export abstract class Auditable {
  createdBy: User;
  createdDate: Date;
  lastModifiedBy: User;
  lastModifiedDate: Date;

  public static toModel(item): Auditable {
    const createdDate = item.createdDate || item.createdOn || item.createdAt;
    const modifiedDate = item.lastModifiedDate || item.updatedOn || item.updatedAt;

    const { createdBy } = item;
    const modifiedBy = item.lastModifiedBy || item.updatedBy;

    return {
      createdBy: createdBy ? User.toModel(createdBy) : null,
      createdDate: DateHelper.toLocalDate(createdDate),
      lastModifiedBy: modifiedBy ? User.toModel(modifiedBy) : null,
      lastModifiedDate: DateHelper.toLocalDate(modifiedDate),
    };
  }
}
