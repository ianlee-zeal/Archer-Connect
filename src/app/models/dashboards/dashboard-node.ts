import { DashboardField } from './dashboard-field';

/**
 * Dashboard node used during API calls
 *
 * @export
 * @class DashboardNode
 */
export class DashboardNode {

  /**
   * Gets or sets row id
   *
   * @type {number}
   * @memberof DashboardNode
   */
  rowId: number;

  /**
   * Gets or sets row name
   *
   * @type {string}
   * @memberof DashboardNode
   */
  rowName: string;

  /**
   * Gets or sets row sort order
   *
   * @type {number}
   * @memberof DashboardNode
   */
  sortOrder?: number;

  countByClaimants?: DashboardField;

  /**
   * Gets or sets the flag indicating whether node is in a final stage or pending
   *
   * @type {boolean}
   * @memberof DashboardNode
   */
  isFinal: boolean;

  /**
   * Gets or sets array of data fields related to the row
   *
   * @type {DashboardField[]}
   * @memberof DashboardNode
   */
  fields: DashboardField[];

  /**
   * Gets or sets array of child nodes
   *
   * @type {DashboardNode[]}
   * @memberof DashboardNode
   */
  childNodes: DashboardNode[];

  /**
   * Gets or sets the flag indicating whether node is engaged or not
   *
   * @type {boolean}
   * @memberof DashboardNode
   */
  isEngaged: boolean;
}
