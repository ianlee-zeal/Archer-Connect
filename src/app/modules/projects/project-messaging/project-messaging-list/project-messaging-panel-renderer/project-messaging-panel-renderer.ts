import { Component } from '@angular/core';
import { GridActionsRendererComponent } from '@app/entities';
import { ProjectCustomMessage } from '@app/models';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';

@Component({
  selector: 'app-project-messaging-panel-renderer',
  templateUrl: './project-messaging-panel-renderer.html',
  styleUrls: ['./project-messaging-panel-renderer.scss'],
})
export class ProjectMessagingPanelRendererComponent extends GridActionsRendererComponent<ProjectCustomMessage> {
  readonly editPermission = PermissionService.create(PermissionTypeEnum.ProjectMessaging, PermissionActionTypeEnum.Edit);
}
