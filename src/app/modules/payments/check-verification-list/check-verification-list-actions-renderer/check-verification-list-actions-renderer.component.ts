import { Component } from '@angular/core';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-check-verification-list-actions-renderer',
  templateUrl: './check-verification-list-actions-renderer.component.html',
  styleUrls: ['./check-verification-list-actions-renderer.component.scss'],
})
export class CheckVerificationListActionsRendererComponent implements ICellRendererAngularComp {
  public params: any;

  public editPermission = PermissionService.create(PermissionTypeEnum.CheckVerification, PermissionActionTypeEnum.Edit);

  public refresh(): boolean {
    return true;
  }

  public agInit(params: any): void {
    this.params = params;
  }

  public onEditClick(): void {
    this.params.editHandler(this.params);
  }

  public onDownloadClick(): void {
    this.params.downloadHandler(this.params);
  }
}
