import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { JiraIssue } from '@app/models/jira/jira-issue';
import { JiraTicketStatusColorsEnum } from '@app/models/jira/ticket-status-color.enum';

@Component({
  selector: 'jira-list-card-preview',
  templateUrl: './jira-list-card-preview.component.html',
  styleUrl: './jira-list-card-preview.component.scss'
})
export class JiraListCardPreviewComponent {

  @Input() public data: JiraIssue;

  protected readonly statuses = JiraTicketStatusColorsEnum;

  constructor(private router: Router)
  {}

  public viewMessage(): void {
    this.router.navigate(['/andi-messaging/message', this.data.id]);
  }
}
