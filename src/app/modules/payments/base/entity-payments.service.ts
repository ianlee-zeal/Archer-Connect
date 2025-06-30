import { Injectable } from '@angular/core';
import { IconHelper } from '@app/helpers';
import { NavItem } from '@app/models';
import { EntityTypeEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { NavItemBadge } from '@app/models/nav-item-badge';
import { PermissionService } from '@app/services';

/**
 * Service for handling entity payments data.
 *
 * @export
 * @class EntityPaymentsService
 */
@Injectable({ providedIn: 'root' })
export class EntityPaymentsService {
  /**
   * Contains flag indicating whether current user has permissions to read disbursements (payments) data, or not
   *
   * @private
   * @memberof EntityPaymentsService
   */
  private readonly hasDisbursementsReadPermission = this.permissionService.has(
    PermissionService.create(PermissionTypeEnum.Disbursements, PermissionActionTypeEnum.Read),
  );

  /**
   * Creates an instance of EntityPaymentsService.
   * @param {PermissionService} permissionService
   * @memberof EntityPaymentsService
   */
  constructor(
    private readonly permissionService: PermissionService,
  ) {
  }

  /**
   * Checks if user has permissions to read disbursements and adds navigation item to the provided collection.
   *
   * @param {string} baseUrl - current base url
   * @param {NavItem[]} items - navigation items
   * @memberof EntityPaymentsService
   */
  addDisbursementsNavigationItem(baseUrl: string, items: NavItem[], badges?: NavItemBadge[]): void {
    if (this.hasDisbursementsReadPermission) {
      items.push(NavItem.create(<NavItem>{
        name: 'Disbursements',
        icon: IconHelper.getIconByEntityType(EntityTypeEnum.Payments),
        route: `${baseUrl}/payments`,
        badges,
      }));
    }
  }
}
