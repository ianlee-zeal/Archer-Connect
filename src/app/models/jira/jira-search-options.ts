import { Auditable } from '../auditable';
import { JiraDateRange } from './jira-date-range';
import { JiraStatus } from './jira-status';

export class JiraSearchOptions extends Auditable {
  userId: number;
  accountId: number;
  searchTerm: string;
  projectIds: number[];
  requestTypes: string[];
  statuses: JiraStatus[];
  updated: JiraDateRange;
  created: JiraDateRange;
  sortField: string;
  sortOrder: string;
  nextPageToken: string;

  resetSearchOptions(): void {
    this.searchTerm = '';
    this.projectIds = [];
    this.requestTypes = [];
    this.statuses = [];
    this.updated = JiraDateRange.getDefaultDateRange();
    this.created = JiraDateRange.getDefaultDateRange();
    this.sortField = null;
    this.sortOrder = null;
  }
}
