import { StringHelper } from '@app/helpers/string.helper';
import { IdValue } from './idValue';
import { TimeZone } from './time-zone';

export class UserProfileDetails {
  userId: number;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  timezone: TimeZone;
  language: string;
  defaultGlobalSearch: IdValue;
  employeeId: number;

  constructor(model?: Partial<UserProfileDetails>) {
    Object.assign(this, model);
  }

  public static toModel(item: any): UserProfileDetails | null {
    if (item) {
      return {
        userId: item.userId,
        firstName: item.firstName,
        lastName: item.lastName,
        displayName: item.displayName,
        email: item.email,
        timezone: TimeZone.toModel(item.timeZone),
        language: StringHelper.capitalize(item.language),
        defaultGlobalSearch: item.defaultGlobalSearch,
        employeeId: item.employeeId,
      };
    }
    return null;
  }

  public static toDto(item: UserProfileDetails): any {
    return {
      userId: item.userId,
      firstName: item.firstName,
      lastName: item.lastName,
      displayName: item.displayName,
      email: item.email,
      timezoneId: item.timezone.id,
      language: item.language,
      defaultGlobalSearchTypeId: item.defaultGlobalSearch.id,
      employeeId: item.employeeId,
    };
  }
}
