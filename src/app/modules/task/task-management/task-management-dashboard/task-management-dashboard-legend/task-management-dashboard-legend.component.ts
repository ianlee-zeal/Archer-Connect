import { Component, Input } from '@angular/core';
import { TeamStats } from '@app/models';

@Component({
  selector: 'app-task-management-dashboard-legend',
  templateUrl: './task-management-dashboard-legend.component.html',
  styleUrls: ['./task-management-dashboard-legend.component.scss'],
})

export class TaskManagementDashboardLegendComponent {
  @Input() legendItems:TeamStats[];
}
