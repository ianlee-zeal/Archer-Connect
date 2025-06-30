import { Component } from '@angular/core';
import { GridActionsRendererComponent } from '@app/entities';
import { TeamToUser } from '@app/models';

@Component({
  selector: 'app-user-teams-grid-actions-renderer',
  templateUrl: './user-teams-grid-actions-renderer.component.html',
  styleUrls: ['./user-teams-grid-actions-renderer.component.scss'],
})
export class UserTeamsGridActionsRendererComponent extends GridActionsRendererComponent<TeamToUser> {
}
