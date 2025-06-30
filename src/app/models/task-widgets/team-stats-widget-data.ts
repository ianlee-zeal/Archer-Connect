import { UsersData } from './users-data';
import { TaskWidgetDataBase } from './base/task-widget-data-base';

export class TeamStatsWidgetData extends TaskWidgetDataBase {
  users: UsersData[];
}
