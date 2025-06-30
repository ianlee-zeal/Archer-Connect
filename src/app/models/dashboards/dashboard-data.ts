import { DashboardRow } from './dashboard-row';

/**
 * Dashboard data type
 *
 * @export
 * @class DashboardData
 */
export class DashboardData {
  /**
   * Gets or sets rows for the dashboard
   *
   * @type {DashboardRow[]}
   * @memberof DashboardData
   */
  rows: DashboardRow[];

  /**
   * Gets or sets message related to the current dataset
   *
   * @type {string}
   * @memberof DashboardData
   */
  message: string;

  projectId:number;

  expandable: boolean;
}
