import { TaskWidgetDataBase } from './base/task-widget-data-base';
import { OverdueGroup } from './task-widget-types';

export class OverdueWidgetData extends TaskWidgetDataBase {
  overdueGroups: OverdueGroup[];
}
