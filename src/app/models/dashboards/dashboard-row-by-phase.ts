import { DashboardField } from './dashboard-field';
import { DashboardRow } from './dashboard-row';

export class DashboardRowByPhase extends DashboardRow {
  children?: DashboardRow[];
  countByClaimants?: DashboardField;
}
