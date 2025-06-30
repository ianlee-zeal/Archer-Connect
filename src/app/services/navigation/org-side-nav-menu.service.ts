import { Injectable } from '@angular/core';

import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { NavItem } from '@app/models/nav-item';
import { SideNavMenuService } from './side-nav-menu.service';
import { PermissionService } from '../permissions.service';

const ORGANIZATIONS_BASE_URL = '/admin/user/orgs';

/**
 * Service for working with organization side menu navigation
 *
 * @export
 * @class OrgSideNavMenuService
 */
@Injectable({ providedIn: 'root' })
export class OrgSideNavMenuService {
  /**
   * Builds and adds navigation menu for organization or sub organization
   *
   * @param {number} organizationId - organization id
   * @param {SideNavMenuService} sideNavMenuService - side navigation menu service
   * @memberof OrgSideNavMenuService
   */
  addNavigationMenuForOrganization(organizationId: number, sideNavMenuService: SideNavMenuService): void {
    const sideNavigationMenuForOrganization = this.buildNavigationMenuForOrganization(
      organizationId,
    );
    sideNavMenuService.removeAll();
    sideNavMenuService.add(sideNavigationMenuForOrganization, null, true);
  }

  /**
   * Builds navigation menu for organizations.
   *
   * If organization is root organization, only organization id must be provided.
   * If organization is sub organization, then both organization ids must be provided.
   *
   * @param {number} organizationId
   * @param {number} subOrganizationId
   * @return {*}  {NavItem[]}
   * @memberof OrgSideNavMenuService
   */
  private buildNavigationMenuForOrganization(organizationId: number): NavItem[] {
    if (!organizationId) {
      throw Error(`Building of navigation menu for organization has failed: orgId=${organizationId}`);
    }

    const baseUrl = `${ORGANIZATIONS_BASE_URL}/${organizationId}`;

    const localMenu = [
      NavItem.create(<NavItem>{
        name: 'Data Management',
        items: [
          NavItem.create(<NavItem>{
            name: 'Organization',
            icon: 'assets/images/organization.svg',
            route: `${baseUrl}/my-organization`,
            permissions: [PermissionService.create(PermissionTypeEnum.Organizations, PermissionActionTypeEnum.Read)],
          }),
          NavItem.create(<NavItem>{
            name: 'Payment Instructions',
            icon: 'assets/images/Bank Accounts.svg',
            route: `${baseUrl}/payment-instructions`,
            permissions: [PermissionService.create(PermissionTypeEnum.BankAccounts, PermissionActionTypeEnum.Read)],
          }),
          NavItem.create(<NavItem>{
            name: 'Sub Organizations',
            icon: 'assets/images/Sub Organizations.svg',
            route: `${baseUrl}/sub-organization`,
            permissions: [PermissionService.create(PermissionTypeEnum.SubOrganizations, PermissionActionTypeEnum.Read)],
          }),
        ],
      }),

      NavItem.create(<NavItem>{
        name: 'User Role Management',
        items: [
          NavItem.create(<NavItem>{
            name: 'Users',
            icon: 'assets/images/users.svg',
            route: `${baseUrl}/users`,
            permissions: PermissionService.create(PermissionTypeEnum.Users, PermissionActionTypeEnum.Read),
          }),
          NavItem.create(<NavItem>{
            name: 'Roles',
            icon: 'assets/images/Roles.svg',
            route: `${baseUrl}/roles`,
            permissions: [PermissionService.create(PermissionTypeEnum.Roles, PermissionActionTypeEnum.Read)],
          }),
          NavItem.create(<NavItem>{
            name: 'Access Policies',
            icon: 'assets/images/Access Policies.svg',
            route: `${baseUrl}/access-policies`,
            permissions: [PermissionService.create(PermissionTypeEnum.AccessPolicies, PermissionActionTypeEnum.Read)],
          }),
        ],
      }),
    ];

    return localMenu;
  }
}
