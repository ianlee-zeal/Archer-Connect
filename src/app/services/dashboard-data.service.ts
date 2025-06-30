/* eslint-disable no-confusing-arrow */
/* eslint-disable prefer-object-spread */
import { Injectable } from '@angular/core';
import { DashboardData, DashboardNode, DashboardRow, DashboardValueType } from '@app/models/dashboards';
import { IDashboardDataConfig, IDashboardItemConfig } from '@app/models/dashboards/dashboard-data-configs';
import { DashboardHeaderRow, InfoBlockItem } from '@app/models';
import { DashboardRowByPhase } from '@app/models/dashboards/dashboard-row-by-phase';

/**
 * Service for processing of dashboard data
 *
 * @export
 * @class DashboardDataService
 */
@Injectable({ providedIn: 'root' })
export class DashboardDataService {
  /**
   * Array of dashboard rows
   *
   * @private
   * @type {DashboardRow[]}
   * @memberof DashboardDataService
   */
  private rows: DashboardRow[];

  /**
   * Converts array of dashboard nodes into dashboard data object using provided configuration.
   *
   * @param {DashboardNode[]} nodes - source dashboard nodes
   * @param {IDashboardDataConfig} config - current dashboard configuration
   * @returns {DashboardData}
   * @memberof DashboardDataService
   */
  toDashboardData(nodes: DashboardNode[], config: IDashboardDataConfig, expandable: boolean): DashboardData {
    const data = new DashboardData();
    this.rows = [];
    data.expandable = expandable;
    for (const node of nodes) {
      this.toRow(node, null, 0, config);
    }
    data.rows = this.rows;
    data.message = !this.rows || !this.rows.length ? 'No Results' : null;
    return data;
  }

  /**
   * Converts dashboard claimant statistics data into local format of array.
   *
   * @param {DashboardHeaderRow[]} projectOverviewStatistics - source data
   * @returns {InfoBlockItem[]}
   * @memberof DashboardDataService
   */
  toStatisticsData(projectOverviewStatistics: DashboardHeaderRow[]): InfoBlockItem[] {
    return projectOverviewStatistics.map(item => this.toBlockItem(item));
  }

  /**
   * Parses dashboard value and returns dashboard statistics item.
   *
   * @private
   * @param {DashboardHeaderRow} row - source row
   * @returns {InfoBlockItem}
   * @memberof DashboardDataService
   */
  private toBlockItem(row: DashboardHeaderRow): InfoBlockItem {
    let value: string;
    switch (row.valueType) {
      case DashboardValueType.Number:
      case DashboardValueType.String:
        value = row.value;
        break;
      case DashboardValueType.Percent:
        value = `${row.value}%`;
        break;
      default:
        value = '';
        break;
    }
    return {
      valueType: row.valueType,
      label: row.name,
      value,
      title: row.description || null,
    };
  }

  toDashboardDataByPhase(nodes: DashboardNode[], config: IDashboardDataConfig, expandable: boolean): DashboardData {
    const data = new DashboardData();
    this.rows = [];
    data.expandable = expandable;

    nodes.sort((a, b) => a.sortOrder - b.sortOrder);

    const list = [];
    let isEmpty = true;
    for (const node of nodes) {
      const item = this.toRowsObj(node, config);
      list.push(item);
      if (item?.children?.length) {
        isEmpty = false;
      }
    }
    data.rows = list;
    data.message = isEmpty ? 'No Results' : null;
    return data;
  }

  /**
   * Converts dashboard node into dashboard row and adds into resulting object.
   *
   * @private
   * @param {DashboardNode} node - source node
   * @param {number} parentId - parent node id
   * @param {number} level - current hierarchy level
   * @param {IDashboardDataConfig} config - dashboard configuration
   * @memberof DashboardDataService
   */
  private toRow(node: DashboardNode, parentId: number, level: number, config: IDashboardDataConfig): void {
    let rowConfig: IDashboardItemConfig = {};
    if (config.levelConfigs) {
      const levelConfig = config.levelConfigs.getValue(level);
      rowConfig = Object.assign({}, levelConfig || {});
    }
    if (config.rowConfigs) {
      rowConfig = Object.assign(rowConfig, config.rowConfigs.getValue(level) || {});
    }
    let row = new DashboardRow();
    if (rowConfig) {
      row = Object.assign(row, rowConfig);
    }
    row.id = node.rowId;
    row.parentId = parentId;
    row.name = node.rowName;
    row.level = level;
    row.isFinal = node.isFinal;
    row.sortOrder = node.sortOrder;
    if (rowConfig.iconGetter) {
      row.icon = rowConfig.iconGetter(row);
    }
    row.fields = Object.assign([], node.fields.sort((a, b) => (a.id > b.id) ? 1 : -1));
    this.rows.push(row);
    if (node.childNodes && node.childNodes.length) {
      const childLevel = level + 1;
      for (const childNode of node.childNodes) {
        this.toRow(childNode, row.id, childLevel, config);
      }
    }
  }

  private toRowsObj(node: DashboardNode, config: IDashboardDataConfig): DashboardRowByPhase {
    let rowConfig: IDashboardItemConfig = {};
    if (config.levelConfigs) {
      const levelConfig = config.levelConfigs.getValue(0);
      rowConfig = Object.assign({}, levelConfig || {});
    }
    if (config.rowConfigs) {
      rowConfig = Object.assign(rowConfig, config.rowConfigs.getValue(0) || {});
    }

    let rowObj = new DashboardRowByPhase();
    if (rowConfig) {
      rowObj = Object.assign(rowObj, rowConfig);
    }
    rowObj.id = node.rowId;
    rowObj.parentId = null;
    rowObj.name = node.rowName;
    rowObj.level = 0;
    rowObj.isFinal = node.isFinal;
    rowObj.countByClaimants = node.countByClaimants;
    rowObj.sortOrder = node.sortOrder;
    if (rowConfig.iconGetter) {
      rowObj.icon = rowConfig.iconGetter(rowObj);
    }
    rowObj.fields = Object.assign([], node.fields.sort((a, b) => (a.id > b.id) ? 1 : -1));
    rowObj.isEngaged = node.isEngaged;
    this.rows = [];
    if (node.childNodes && node.childNodes.length) {
      for (const childNode of node.childNodes) {
        this.toRow(childNode, rowObj.id, 1, config);
      }
    }
    rowObj.children = [...this.rows];

    return rowObj;
  }

}
