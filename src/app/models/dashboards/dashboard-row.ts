/* eslint-disable @typescript-eslint/indent */
import { DashboardRowColor } from './dashboard-row-color';
import { DashboardField } from './dashboard-field';
import { IDashboardItemConfig } from './dashboard-data-configs';

/**
 * Dashboard row used in dashboard tables
 *
 * @export
 * @class DashboardRow
 * @implements {IDashboardItemConfig}
 */
export class DashboardRow implements IDashboardItemConfig {
    /**
     * Gets or sets row id
     *
     * @type {number}
     * @memberof DashboardRow
     */
    id: number;

    /**
     * Gets or sets parent row id
     *
     * @type {number}
     * @memberof DashboardRow
     */
    parentId: number;

    /**
     * Gets or sets row label
     *
     * @type {string}
     * @memberof DashboardRow
     */
    name: string;

    /**
     * Gets or sets row sort order
     *
     * @type {number}
     * @memberof DashboardRow
     */
    sortOrder?: number;

    /**
     * Gets or sets the flag indicating whether row is expandable or not
     *
     * @type {boolean}
     * @memberof DashboardRow
     */
    expandable: boolean;

    /**
     * Gets or sets the flag indicating whether row is expanded or not
     *
     * @type {boolean}
     * @memberof DashboardRow
     */
    expanded: boolean;

    /**
    * Gets or sets the hierarchy level value which must be expanded or collapsed when user expands current section.
    * If not set - all child levels would be expanded or collapsed.
    *
    * @type {number}
    * @memberof DashboardRow
    */
    expandedLevels?: number;

    /**
     * Gets or sets the flag indicating whether row is hidden or not
     *
     * @type {boolean}
     * @memberof DashboardRow
     */
    hidden = false;

    /**
     * Gets or sets row background color
     *
     * @type {DashboardRowColor}
     * @memberof DashboardRow
     */
    color: DashboardRowColor;

    /**
     * Gets or sets row icon value
     *
     * @type {string}
     * @memberof DashboardRow
     */
    icon: string;

    /**
     * Gets or sets current hierarchy level
     *
     * @type {number}
     * @memberof DashboardRow
     */
    level: number;

    /**
     * Gets or sets the flag indicating whether node is in a final stage or pending
     *
     * @type {boolean}
     * @memberof DashboardRow
     */
    isFinal: boolean;

    /**
     * Gets or sets data fields related to the row
     *
     * @type {DashboardField[]}
     * @memberof DashboardRow
     */
    fields: DashboardField[];

    /**
     * Gets or sets the flag indicating whether node is engaged or not
     *
     * @type {boolean}
     * @memberof DashboardNode
     */
    isEngaged: boolean;
}
