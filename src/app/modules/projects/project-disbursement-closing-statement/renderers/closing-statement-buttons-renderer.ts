import { Document } from '@app/models/documents';
import { Component } from '@angular/core';
import { GridActionsRendererComponent } from '@app/entities';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';

@Component({
  selector: 'app-closing-statement-buttons-renderer',
  templateUrl: './closing-statement-buttons-renderer.html',
  styleUrls: ['./closing-statement-buttons-renderer.scss'],
})
export class ClosingStatementRendererComponent extends GridActionsRendererComponent<Document> {
  public editPermission = PermissionService.create(PermissionTypeEnum.ProjectsClosingStatement, PermissionActionTypeEnum.Edit);
}
