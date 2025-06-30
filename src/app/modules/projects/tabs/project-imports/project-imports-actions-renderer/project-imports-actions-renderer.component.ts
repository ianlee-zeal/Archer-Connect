import { Component } from '@angular/core';
import { PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'project-imports-actions-renderer',
  templateUrl: 'project-imports-actions-renderer.component.html',
  styleUrls: ['./project-imports-actions-renderer.component.scss'],
})
export class ProjectImportsActionsRendererComponent implements ICellRendererAngularComp {
  public params: any;
  public canDownloadFiles: boolean;

  constructor(
    private permissionService: PermissionService,
  ) {

  }

  // eslint-disable-next-line class-methods-use-this
  public refresh(): boolean {
    return true;
  }

  public agInit(params: any): void {
    this.params = params;
    this.canDownloadFiles = this.permissionService.canRead(PermissionTypeEnum.Admin);
  }

  public onEditDocumentClick(): void {
    this.params.editUploadBulkDocumentHandler(this.params);
  }

  public onDownloadDocumentClick(): void {
    this.params.downloadLogHandler(this.params);
  }

  public onDownloadFilesClick(): void {
    this.params.downloadFilesHandler(this.params);
  }
}
