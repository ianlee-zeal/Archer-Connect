import { Org } from '../org';
import { PermissionV2 } from '..';
import { TimeZone } from '../time-zone';
import { DefaultGlobalSearchType } from '../enums';
import { OrganizationRole } from '../organization-role';

export class UserInfo {
  id: number;
  username: string;
  userGuid: string;
  permissions: PermissionV2[];
  organizations: Org[];
  selectedOrganization: Org;
  defaultOrganization: Org;
  defaultGlobalSearchType: DefaultGlobalSearchType;
  timezone: TimeZone;
  roles: OrganizationRole[];
  displayName: string;
  isImpersonating: boolean;
}
