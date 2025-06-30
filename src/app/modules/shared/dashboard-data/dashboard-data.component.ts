import { Component, Input, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';

import { DashboardRowColor, DashboardData, DashboardRow, DashboardEventData, IDashboardDataConfig, FinalizationCount } from '@app/models/dashboards';
import { KeyValuePair, Dictionary, IDictionary } from '@app/models/utils';
import { StringHelper } from '@app/helpers/string.helper';
import { DashboardRowByPhase } from '@app/models/dashboards/dashboard-row-by-phase';
import { ProductCategory } from '@app/models/enums';
import { DeficienciesWidgetData } from '@app/models/dashboards/deficiencies-response';
import { DashboardField } from '../../../models/dashboards/dashboard-field';

/**
 * Component for showing of the dashboard data
 *
 * @export
 * @class DashboardDataComponent
 * @implements {OnChanges}
 */
@Component({
  selector: 'app-dashboard-data',
  templateUrl: './dashboard-data.component.html',
  styleUrls: ['./dashboard-data.component.scss'],
})
export class DashboardDataComponent implements OnChanges {
  private summaryField: DashboardField;

  /**
   * Enum with available row colors
   *
   * @memberof DashboardDataComponent
   */
  readonly colors = DashboardRowColor;

  /**
   * Event fired when section is being expanded or collapsed
   *
   * @memberof DashboardDataComponent
   */
  @Output()
  readonly toggleSection = new EventEmitter<DashboardRow>();

  /**
   * Event fired when user clicks on one of the values in dashboard table
   *
   * @memberof DashboardDataComponent
   */
  @Output()
  readonly valueClick = new EventEmitter<DashboardEventData>();

  /**
   * Gets or sets dashboard data
   *
   * @type {DashboardData}
   * @memberof DashboardDataComponent
   */
  @Input() data: DashboardData;

  @Input() dataByPhase: DashboardData;

  @Input() recentFinalizationsCounts: IDictionary<number, FinalizationCount>;

  @Input() onFinalizationWidgetChange: any;
  @Input() deficienciesWidgetData: DeficienciesWidgetData;

  /**
   * Gets or sets current dashboard configuration
   *
   * @type {IDashboardDataConfig}
   * @memberof DashboardDataComponent
   */
  @Input() config: IDashboardDataConfig;

  /** @inheritdoc */
  ngOnChanges(changes: SimpleChanges): void {
    if ((changes.data || changes.config) && this.data && this.data.rows.length && this.config) {
      this.summaryField = this.data.rows[0].fields.find(f => StringHelper.equal(f.name, this.config.summaryFieldName));
    }
  }

  /**
   * Event handler for value click at dashboard table
   *
   * @param {DashboardRow} row - clicked row
   * @param {number} fieldIndex - clicked field
   * @memberof DashboardDataComponent
   */
  onValueClick(rowIndex: number, fieldIndex: number) {
    const row = this.data.rows[rowIndex];
    if (!row.fields[fieldIndex].value) {
      return;
    }
    const field = row.fields[fieldIndex];
    let level = +row.level;
    const path: KeyValuePair<string, DashboardField>[] = [
      this.getFilter(row, fieldIndex),
    ];
    for (let i = rowIndex - 1; i >= 0; i--) {
      const checkedRow = this.data.rows[i];
      if (checkedRow.level < level) {
        const item = this.getFilter(checkedRow, fieldIndex);
        path.unshift(item);
        level--;
      }
    }
    const fieldFilter = this.config.fieldLabelConfig.getItem(field.name);
    if (fieldFilter) {
      path.push(new KeyValuePair(fieldFilter.value, field));
    }
    this.valueClick.emit({
      row,
      field,
      summaryFieldId: this.summaryField?.id,
      path: new Dictionary(path),
    });
  }

  private getFilter(row: DashboardRow, fieldIndex: number): KeyValuePair<string, DashboardField> {
    return new KeyValuePair(
      this.config.levelLabelConfig.getValue(row.level),
      { ...row.fields[fieldIndex], name: row.name },
    );
  }

  onCountByClaimantsClick(rowIndex: number): void {
    const row = this.dataByPhase.rows[rowIndex] as DashboardRowByPhase;
    const rowValue = +(row.countByClaimants?.value || 0);
    if (!rowValue) {
      return;
    }
    const field = row.countByClaimants;
    const path: KeyValuePair<string, DashboardField>[] = [
      new KeyValuePair(
        this.config.levelLabelConfig.getValue(row.level),
        { ...row.countByClaimants, name: row.name },
      ),
    ];

    this.valueClick.emit({
      row,
      field,
      summaryFieldId: this.summaryField?.id,
      path: new Dictionary(path),
    });
  }

  onRowDataToggle(rowIndex: number) {
    const row = this.dataByPhase.rows[rowIndex] as DashboardRowByPhase;
    this.toggleSection.emit(row);
  }

  isMedicalLiens(productCategoryId: number) {
    return productCategoryId === ProductCategory.MedicalLiens;
  }
}
