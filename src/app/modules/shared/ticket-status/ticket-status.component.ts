import { Component, Input } from '@angular/core';
import { JiraTicketStatusColorsEnum } from '@app/models/jira/ticket-status-color.enum';
import { JiraStatus } from '@app/models/jira/jira-status';

@Component({
  selector: 'app-ticket-status',
  templateUrl: './ticket-status.component.html',
  styleUrl: './ticket-status.component.scss'
})
export class TicketStatusComponent {
  public readonly statuses = JiraTicketStatusColorsEnum;

  @Input() public status: JiraStatus;


}
