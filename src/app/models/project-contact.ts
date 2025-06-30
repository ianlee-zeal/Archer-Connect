import { Org, User } from '@app/models';
import { DateHelper } from '@app/helpers/date.helper';
import { StringHelper } from '@app/helpers';

export class ProjectContact {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  organizationResponse: Org;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  primaryPhone: string;
  directPhone: string;
  fax: string;
  email: string;
  notes: string;
  lastUpdated: Date;
  active: boolean;
  displayName: string;
  lastReportDate: Date;
  user: User;
  viewOrgId: number;
  viewOrgName: string;
  viewPrimaryOrgTypeId: number;
  viewPrimaryOrgTypeName: string;
  orgIdName: string;
  orgTypeIdName: string;
  userIdName: string;
  viewFirstName: string;
  viewLastName: string;
  viewOrgIsMaster: boolean;

  public static toModel(item: any): ProjectContact {
      if (item) {
      return {
        ...item,
        fullName: `${item.viewFirstName || ''} ${item.viewLastName || ''}`,
        lastUpdated: DateHelper.toLocalDate(item.lastUpdated),
        lastReportDate: DateHelper.toLocalDate(item.lastReportDate),
        user: User.toModel(item.user),
        orgTypeIdName: StringHelper.buildIdName(item.viewPrimaryOrgTypeId, item.viewPrimaryOrgTypeName),
        orgIdName: StringHelper.buildIdName(item.viewOrgId, item.viewOrgName),
        userIdName: StringHelper.buildIdName(item.userId, item.displayName),
      };
    }

    return null;
  }
}
