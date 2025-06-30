import { IDictionary } from '../utils/dictionary';
import { DashboardField } from './dashboard-field';
import { DashboardRow } from './dashboard-row';

/**
 * Dashboard event data
 *
 * @export
 * @class DashboardEventData
 */
export class DashboardEventData {
  /**
   * Gets or sets dashboard row data for the event
   *
   * @type {DashboardRow}
   * @memberof DashboardEventData
   */
  row: DashboardRow;

  /**
   * Gets or sets field for the event
   *
   * @type {DashboardField}
   * @memberof DashboardEventData
   */
  field: DashboardField;

  /**
   * Gets or sets the summary field id
   *
   * @type {number}
   * @memberof DashboardEventData
   */
  summaryFieldId: number;

  /**
   * Gets or sets hierarchy path to the selected row
   *
   * @type {IDictionary<string, DashboardField>}
   * @memberof DashboardEventData
   */
  path: IDictionary<string, DashboardField>;
}
