import { TeamStatsWidgetData } from './team-stats-widget-data';
import { OverdueWidgetData } from './overdue-widget-data';
import { SummaryWidgetData } from './summary-widget-data';
import { AgingWidgetData } from './aging-widget-data';

export class TaskWidget {
  taskWidgetType:number;
  taskWidgetName:string;
  taskWidgetData: TeamStatsWidgetData | OverdueWidgetData | SummaryWidgetData | AgingWidgetData;
}
