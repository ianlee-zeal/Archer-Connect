/**
 * Dashboard field type
 *
 * @export
 * @class DashboardField
 */
export class DashboardField {
  /**
     * Gets or sets field id
     *
     * @type {number}
     * @memberof DashboardField
     */
  id: number;

  /**
     * Gets or sets field name
     *
     * @type {string}
     * @memberof DashboardField
     */
  name: string;

  /**
     * Gets or sets field value
     *
     * @type {number}
     * @memberof DashboardField
     */
  value: number | string;

  /**
     * Gets or sets filter parameter name used for getting of data related to the field
     *
     * @type {string}
     * @memberof DashboardField
     */
  filterParameter: string;

  /**
     * Gets or sets filter parameter value used for getting of data related to the field
     *
     * @type {number}
     * @memberof DashboardField
     */
  filterValue: number;
}
