import { DateHelper } from '@app/helpers/date.helper';
import { Auditable } from '../auditable';
import { IdValue } from '../idValue';
import { User } from '../user';

export class ProjectCustomMessage extends Auditable {
  id?: number;
  primaryOrg?: IdValue;
  primaryOrgId?: number;
  projectId?: number;
  message: string;
  active: boolean;

  constructor(model?: Partial<ProjectCustomMessage>) {
    super();
    Object.assign(this, model);
  }

  public static toModel(item: any): ProjectCustomMessage | null {
    const { lastModifiedDate, lastModifiedBy, createdBy, createdDate } = item;
    if (item) {
      return {
        ...item,
        lastModifiedBy: lastModifiedBy ? User.toModel(lastModifiedBy) : User.toModel(createdBy),
        lastModifiedDate: lastModifiedDate ? DateHelper.toLocalDate(lastModifiedDate) : DateHelper.toLocalDate(createdDate),
      };
    }
    return null;
  }

  public static toDto(item: ProjectCustomMessage): any {
    return {
      message: item.message,
      primaryOrgId: item.primaryOrg.id,
      projectId: item.projectId,
      active: item.active,
    };
  }
}
