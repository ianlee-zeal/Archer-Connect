import { Component, Input } from '@angular/core';
import { JiraIssue } from '@app/models/jira/jira-issue';
import { JiraTicketStatusColorsEnum } from '@app/models/jira/ticket-status-color.enum';

@Component({
  selector: 'jira-list-card',
  templateUrl: './jira-list-card.component.html',
  styleUrl: './jira-list-card.component.scss'
})
export class JiraListCardComponent {

  @Input() public data: JiraIssue;

  protected readonly statuses = JiraTicketStatusColorsEnum;
}
