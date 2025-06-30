import { DateHelper } from '@app/helpers/date.helper';

export class OrganizationRole {
  public id: number;
  public name: string;
  public lastModifiedDate: Date | null;
  public lastModifiedBy: string;
  public organizationName: string;

  public static toModel(item: any) : OrganizationRole | null {
    if (item) {
      return {
        id: item.id,
        name: item.name,
        lastModifiedDate: DateHelper.toLocalDate(item.lastModifiedDate),
        lastModifiedBy: item?.lastModifiedBy?.displayName,
        organizationName: item.organizationName,
      };
    }

    return null;
  }
}
