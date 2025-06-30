import { Component, OnChanges, Input, SimpleChanges } from '@angular/core';
import { AgingTaskStats, TableItem } from '@app/models';

@Component({
  selector: 'app-task-management-dashboard-aging-widget',
  templateUrl: './task-management-dashboard-aging-widget.component.html',
  styleUrls: ['./task-management-dashboard-aging-widget.component.scss'],
})
export class TaskManagementDashboardAgingWidgetComponent implements OnChanges {
  @Input() agingData: AgingTaskStats[];
  @Input() agingRowClick: (priority:string) => void;

  titles$: TableItem[];
  totals$: TableItem[];
  highs$: TableItem[];
  showHighs$: boolean;
  mediums$: TableItem[];
  showMediums$: boolean;
  lows$: TableItem[];
  showLows$: boolean;

  constructor() {
    this.clear();
  }

  private leftColumn = { title: '', total: 'Total', high: 'High', medium: 'Medium', low: 'Low', color: '#0C0C0C' };

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.agingData?.currentValue) {
      this.getData(this.leftColumn, changes.agingData.currentValue);
    }
  }

  public rowClickHandler(priority:string) {
    this.agingRowClick(priority);
  }

  private clear() {
    this.titles$ = [];
    this.totals$ = [];
    this.highs$ = [];
    this.showHighs$ = false;
    this.mediums$ = [];
    this.showMediums$ = false;
    this.lows$ = [];
    this.showLows$ = false;
  }

  private getData(leftColumn: AgingTaskStats, data?: AgingTaskStats[]) {
    this.clear();
    const agingData:AgingTaskStats[] = [];
    if (data) {
      this.showHighs$ = data.some(element => element.high !== undefined);
      this.showMediums$ = data.some(element => element.medium !== undefined);
      this.showLows$ = data.some(element => element.low !== undefined);

      agingData.push(leftColumn);
      agingData.push(...data);

      agingData.forEach(dataRow => {
        this.titles$.push({ value: dataRow.title, color: '' });
        this.totals$.push({ value: dataRow.total, color: dataRow.color });
        this.highs$.push({ value: dataRow.high, color: dataRow.color });
        this.mediums$.push({ value: dataRow.medium, color: dataRow.color });
        this.lows$.push({ value: dataRow.low, color: dataRow.color });
      });
    }
  }
}
