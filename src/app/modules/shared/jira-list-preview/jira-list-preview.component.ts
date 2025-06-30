import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { JiraIssue } from '@app/models/jira/jira-issue';

@Component({
  selector: 'jira-list-preview',
  templateUrl: './jira-list-preview.component.html',
  styleUrls: ['./jira-list-preview.component.scss']
})
export class JiraListPreviewComponent {

  @Input() data: JiraIssue[] = [];

  @Output() readonly cardClick = new EventEmitter();

  public selectedIssue: JiraIssue | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data && changes.data.currentValue?.length > 0) {
      this.selectedIssue = changes.data.currentValue[0] as JiraIssue;
      this.cardClick.emit(this.selectedIssue);
    }
  }

  public selectIssue(issue: JiraIssue): void {
    if (this.data.includes(issue)) {
      this.selectedIssue = issue;
      this.cardClick.emit(this.selectedIssue);
    }
  }

}
