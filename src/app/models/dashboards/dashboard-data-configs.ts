import { IconHelper } from '@app/helpers';
import { DashboardRowColor } from './dashboard-row-color';
import { IDictionary, KeyValuePair, Dictionary } from '../utils';
import { LienPhase } from '../enums';
import { DashboardSectionLevel } from './dashboard-section-level.enum';

/**
 * Describes dashboard data configuration
 *
 * @export
 * @interface IDashboardDataConfig
 */
export interface IDashboardDataConfig {

  /**
  * Show header
  * @type {boolean}
  * @memberof IDashboardDataConfig
  */
  showHeader?: boolean;

  /**
  * Configurations related to the dashboard hierarchy levels
  *
  * @type {IDictionary<DashboardSectionLevel, IDashboardItemConfig>}
  * @memberof IDashboardDataConfig
  */
  levelConfigs?: IDictionary<DashboardSectionLevel, IDashboardItemConfig>;

  /**
  * Configurations related to the particular row names
  *
  * @type {IDictionary<number, IDashboardItemConfig>}
  * @memberof IDashboardDataConfig
  */
  rowConfigs?: IDictionary<number, IDashboardItemConfig>;

  /**
   * Configuration for labels related to the dashboard levels for the
   * filtered list of dashboard entities
   *
   * @type {IDictionary<DashboardSectionLevel, string>}
   * @memberof IDashboardDataConfig
   */
  levelLabelConfig?: IDictionary<DashboardSectionLevel, string>;

  /**
   * Configuration for labels related to the dashboard fields for the
   * filtered list of dashboard entities
   *
   * @type {IDictionary<string, string>}
   * @memberof IDashboardDataConfig
   */
  fieldLabelConfig?: IDictionary<string, string>;

  /**
   * Field name which used for showing of the summary data for dashboard entity (count, etc.).
   *
   * @type {string}
   * @memberof IDashboardDataConfig
   */
  summaryFieldName?: string;
}

/**
 * Describes dashboard configuration item
 *
 * @export
 * @interface IDashboardItemConfig
 */
export interface IDashboardItemConfig {

  /**
  * Defines the flag which indicates whether current hierarchy level is expandable or not
  *
  * @type {boolean}
  * @memberof IDashboardItemConfig
  */
  expandable?: boolean;

  /**
   * Defines the hierarchy level value which must be expanded or collapsed when user expands current section.
   * If not set - all child levels would be expanded or collapsed.
   *
   * @type {DashboardSectionLevel}
   * @memberof IDashboardItemConfig
   */
  expandedLevels?: DashboardSectionLevel;

  /**
  * Defines row color
  *
  * @type {DashboardRowColor}
  * @memberof IDashboardItemConfig
  */
  color?: DashboardRowColor;

  /**
  * Defines icon value for the row
  *
  * @type {string}
  * @memberof IDashboardItemConfig
  */
  icon?: string;

  /**
   * Defines the function which returns icon URL
   *
   * @type {Function}
   * @memberof IDashboardItemConfig
   */
  iconGetter?: Function;

  /**
   * Gets or sets the flag indicating whether node is in a final stage or pending
   *
   * @type {boolean}
   * @memberof IDashboardItemConfig
   */
  isFinal?: boolean;
}

/**
 * Class describing dashboard configuration for the project overview
 *
 * @export
 * @class ProjectOverviewDashboardConfig
 * @implements {IDashboardDataConfig}
 */
export class ProjectOverviewDashboardConfig implements IDashboardDataConfig {
  static filterAge = 'Age';
  static filterType = 'Type';

  constructor(expandable: boolean) {
    this.levelConfigs = new Dictionary<number, IDashboardItemConfig>([
      new KeyValuePair(DashboardSectionLevel.First, {
        expandable: expandable,
        expanded: true,
        expandedLevels: DashboardSectionLevel.Second,
        color: DashboardRowColor.Grey,
      }),
    ]);
  }

  /** @inheritdoc */
  levelConfigs = null;

  /** @inheritdoc */
  rowConfigs = new Dictionary<number, IDashboardItemConfig>([
    new KeyValuePair(DashboardSectionLevel.Third, {
      iconGetter: (row: IDashboardItemConfig) => {
        const phase = row.isFinal ? LienPhase.Finalized : LienPhase.PendingSettlement;
        return IconHelper.getLienPhaseIcon(phase);
      },
    }),
  ]);

  /** @inheritdoc */
  levelLabelConfig = new Dictionary<number, string>([
    new KeyValuePair(DashboardSectionLevel.First, ProjectOverviewDashboardConfig.filterType),
    new KeyValuePair(DashboardSectionLevel.Second, 'Phase'),
    new KeyValuePair(DashboardSectionLevel.Third, 'Stage'),
  ]);

  /** @inheritdoc */
  fieldLabelConfig = new Dictionary<string, string>([
    new KeyValuePair('< 30 days', ProjectOverviewDashboardConfig.filterAge),
    new KeyValuePair('31 - 90 days', ProjectOverviewDashboardConfig.filterAge),
    new KeyValuePair('> 91 days', ProjectOverviewDashboardConfig.filterAge),
  ]);

  /** @inheritdoc */
  summaryFieldName = 'Count By Claimants';

  /** @inheritdoc */
  showHeader = false;
}
