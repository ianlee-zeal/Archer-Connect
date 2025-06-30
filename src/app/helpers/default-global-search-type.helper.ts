import { DefaultGlobalSearchType } from '@app/models/enums/default-global-search-type.enum';

export class DefaultGlobalSearchTypeHelper {
  public static defaultGlobalSearchToRoute(name: DefaultGlobalSearchType) {
    switch (name) {
      case DefaultGlobalSearchType.Projects:
        return '/projects';
      case DefaultGlobalSearchType.Claimants:
        return '/claimants';
      case DefaultGlobalSearchType.Documents:
        return '/dashboard/documents';
      case DefaultGlobalSearchType.Organizations:
        return '/admin/user/orgs';
      case DefaultGlobalSearchType.Payments:
        return '/admin/payments';
      case DefaultGlobalSearchType.Persons:
        return '/dashboard/persons/';
      case DefaultGlobalSearchType.Users:
        return '/admin/user/users';
      case DefaultGlobalSearchType.Probates:
        return '/probates';
      default:
        return '/claimants';
    }
  }
}
