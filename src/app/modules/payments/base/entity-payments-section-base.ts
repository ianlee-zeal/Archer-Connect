import { TabItem } from '@app/models';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';

/**
 * Base class for entity payments section components
 *
 * @export
 * @abstract
 * @class EntityPaymentsSectionBase
 */
export abstract class EntityPaymentsSectionBase {
  protected readonly tabsUrl = './tabs';

  /**
   * Payment history tab
   *
   * @type {TabItem}
   * @memberof EntityPaymentsSectionBase
   */
  protected readonly paymentsTab: TabItem = {
    title: 'Payment History',
    link: `${this.tabsUrl}/history`,
    permission: PermissionService.create(PermissionTypeEnum.PaymentHistory, PermissionActionTypeEnum.Read),
  };
}
