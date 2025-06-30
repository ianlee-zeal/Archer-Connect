import { Component, OnChanges, Input, SimpleChanges } from '@angular/core';
import { OverdueTaskStats } from '@app/models/task-widgets/task-widget-types';

@Component({
  selector: 'app-task-management-dashboard-overdue-tasks-widget',
  templateUrl: './task-management-dashboard-overdue-tasks-widget.component.html',
  styleUrls: ['./task-management-dashboard-overdue-tasks-widget.component.scss'],
})

export class TaskManagementDashboardOverdueTasksWidgetComponent implements OnChanges {
  @Input() overdueData: OverdueTaskStats[];
  @Input() setOverdueFilter: (overdue:string) => void;

  public titles$: string[];
  public values$: string[];
  public percents$: Array<{ value: number, color: string }>;

  constructor() {
    this.clearData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.overdueData?.currentValue) {
      this.clearData();
      changes.overdueData.currentValue.forEach(dataRow => {
        this.titles$.push(dataRow.title);
        this.values$.push(dataRow.count);
        this.percents$.push({ value: dataRow.percent, color: dataRow.color });
      });
    }
  }

  public overdueClickHandler(overdue:string) {
    this.setOverdueFilter(overdue);
  }

  private clearData() {
    this.titles$ = [];
    this.values$ = [];
    this.percents$ = [];
  }
}
