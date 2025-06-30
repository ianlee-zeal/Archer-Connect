import { DashboardValueType } from './dashboards/api/dashboard-value-type';

/**
 * Item type for component with information blocks.
 *
 * @export
 * @class InfoBlockItem
 */
export class InfoBlockItem {
  /**
   * Gets or sets information block label.
   *
   * @type {string}
   * @memberof InfoBlockItem
   */
  label: string;

  /**
   * Gets or sets information block value.
   *
   * @type {string}
   * @memberof InfoBlockItem
   */
  value: string;

  /**
   * Gets or sets information block title.
   *
   * @type {string}
   * @memberof InfoBlockItem
   */
  title?: string;

  /**
   * Gets or sets value type
   *
   * @type {DashboardValueType}
   * @memberof InfoBlockItem
   */
  valueType?: DashboardValueType;
}
