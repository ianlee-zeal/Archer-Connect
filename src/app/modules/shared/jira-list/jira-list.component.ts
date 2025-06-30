import { Component, Input, SimpleChanges } from '@angular/core';
import { JiraIssue } from '@app/models/jira/jira-issue';

@Component({
  selector: 'jira-list',
  templateUrl: './jira-list.component.html',
  styleUrls: ['./jira-list.component.scss']
})
export class JiraListComponent {

  @Input() data: JiraIssue[] = [];

  public selectedIssue: JiraIssue | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data && changes.data.currentValue?.length > 0) {
      this.selectedIssue = changes.data.currentValue[0] as JiraIssue;
    }
  }

  public selectIssue(issue: JiraIssue): void {
    if (this.data.includes(issue)) {
      this.selectedIssue = issue;
    }
  }

}
