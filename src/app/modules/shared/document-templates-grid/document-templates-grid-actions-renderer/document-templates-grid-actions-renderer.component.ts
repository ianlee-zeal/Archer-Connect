import { Component } from '@angular/core';
import { PermissionService } from '@app/services';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { GridActionsRendererComponent } from '@app/entities';
import { DocumentTemplate } from '../../../../models/documents/document-generators/document-template';

@Component({
  selector: 'app-document-templates-grid-actions-renderer',
  templateUrl: './document-templates-grid-actions-renderer.component.html',
  styleUrls: ['./document-templates-grid-actions-renderer.component.scss'],
})
export class DocumentTemplatesGridActionsRendererComponent extends GridActionsRendererComponent<DocumentTemplate> {
  public editPermission: string;
  agInit(params: any): void {
    this.params = params;
    this.editPermission = PermissionService.create(PermissionTypeEnum.Templates, PermissionActionTypeEnum.Edit);
  }
}
