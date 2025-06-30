import { DashboardValueType } from './dashboard-value-type';

/**
 * Class describes dashboard row which used as header block for dashboard with some statistics information.
 *
 * @export
 * @class DashboardHeaderRow
 */
export class DashboardHeaderRow {
  /**
   * Gets or sets current row name
   *
   * @type {string}
   * @memberof DashboardHeaderRow
   */
  name: string;

  /**
   * Gets or sets current row value
   *
   * @type {string}
   * @memberof DashboardHeaderRow
   */
  value: string;

  /**
   * Gets or sets current value type
   *
   * @type {DashboardValueType}
   * @memberof DashboardHeaderRow
   */
  valueType: DashboardValueType;

  /**
   * Gets or sets current value description
   *
   * @type {string}
   * @memberof DashboardHeaderRow
   */
  description: string;
}
