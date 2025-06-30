import { TaskWidgetDataBase } from './base/task-widget-data-base';
import { Stages } from './task-widget-types';

export class SummaryWidgetData extends TaskWidgetDataBase {
  stages: Stages[];
}
