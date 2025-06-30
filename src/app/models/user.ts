/* eslint-disable import/no-cycle */
import { DateHelper } from '@app/helpers/date.helper';
import { OrganizationRole } from './organization-role';
import { IdValue } from './idValue';
import { Org } from './org';
import { TimeZone } from './time-zone';
import { TeamToUser } from './team-to-user';
import { StringHelper } from '@app/helpers';

export class User {
  id: number;
  appUserId: string;
  userName: string;
  password: string;
  displayName: string;
  email: string;
  timezone: string;
  createdBy: string;
  createdDate: Date | null;
  lastModifiedBy: string;
  lastModifiedDate: Date | null;
  lastLoginDate: Date | null;
  lastIp: string | null;
  roles: OrganizationRole[];
  teams: TeamToUser[];
  isActive: boolean;
  isLocked: boolean;
  firstName: string;
  lastName: string;
  isEmailConfirmed: boolean | null;
  defaultGlobalSearchType: IdValue;
  defaultOrganization: Org;
  organization: Org;
  isTwoFactorEnabled: boolean;
  isResetMfaEnabled: boolean;
  timeZone: TimeZone;
  employeeId: number;
  isImpersonating: boolean;
  idName: string;
  idUsername: string;
  organizationIdName: string;

  constructor(model?: Partial<User>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): User | null {
    if (item) {
      return {
        id: item.id,
        appUserId: item.appUserId,
        userName: item.username,
        firstName: item.firstName,
        lastName: item.lastName,
        password: item.password,
        displayName: item.displayName,
        email: item.email,
        timezone: item.timeZone,
        createdDate: DateHelper.toLocalDate(item.createdDate),
        createdBy: item.createdBy,
        lastModifiedBy: item.lastModifiedBy,
        lastModifiedDate: DateHelper.toLocalDate(item.lastModifiedDate),
        lastLoginDate: DateHelper.toLocalDate(item.lastLogin),
        lastIp: item.lastIp,
        roles: item.roles && item.roles.map(OrganizationRole.toModel),
        isActive: item.isActive,
        isLocked: item.isLocked,
        defaultGlobalSearchType: item.defaultGlobalSearchType,
        defaultOrganization: item.defaultOrganization,
        isEmailConfirmed: item.isEmailConfirmed,
        isTwoFactorEnabled: item.isTwoFactorEnabled,
        isResetMfaEnabled: item.isResetMfaEnabled,
        timeZone: TimeZone.toModel(item.timeZone),
        employeeId: item.employeeId,
        teams: item.teams,
        isImpersonating: item.isImpersonating,
        idName: StringHelper.buildIdName(item.id, item.displayName),
        idUsername: StringHelper.buildIdName(item.id, item.username),
        organizationIdName: StringHelper.buildIdName(item.org?.id, item.org?.name),
        organization: item.org,
      };
    }

    return null;
  }

  public static toDTO(item: User): any {
    return {
      ...item,
      timezoneId: item.timeZone?.id,
    };
  }
}
