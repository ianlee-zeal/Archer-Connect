import { Component } from '@angular/core';
import { DocumentLink } from '@app/models/documents';

import { EntityTypeEnum, PermissionActionTypeEnum } from '@app/models/enums';
import { Policy } from '@app/modules/auth/policy';
import { PermissionService } from '@app/services';
import { BaseCellRendererComponent } from '../../_abstractions/base-cell-renderer';

@Component({
  selector: 'app-documents-list-actions-cell-renderer',
  templateUrl: 'documents-list-actions-renderer.component.html',
  styleUrls: ['./documents-list-actions-renderer.component.scss'],
})
export class DocumentsListActionsCellRendererComponent extends BaseCellRendererComponent {
  public params: any;
  public downloadPermissions: string[] = [];

  constructor(private readonly permissionService: PermissionService) {
    super();
  }

  public get iconHidden() : boolean {
    return !this.permissionService.hasAny(this.downloadPermissions);
  }

  public agInit(params: any): void {
    super.agInit(params);

    const { documentLinks } = params.data;
    this.downloadPermissions = documentLinks?.map((docLink: DocumentLink) => {
      const entityType = this.getEntityTypeForPermission(docLink);
      return PermissionService.create(Policy.getDocuments(entityType), PermissionActionTypeEnum.Read);
    });
  }

  private getEntityTypeForPermission(docLink: DocumentLink): number {
    const { entityType } = docLink;
    return entityType.id === EntityTypeEnum.LienProducts ? EntityTypeEnum.Clients : entityType.id;
  }

  public onDownloadDocumentClick(): void {
    this.params.downloadDocumentHandler(this.params);
  }
}
