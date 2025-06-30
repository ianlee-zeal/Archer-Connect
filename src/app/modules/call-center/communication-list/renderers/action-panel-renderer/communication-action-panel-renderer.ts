import { Component } from '@angular/core';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-communication-action-panel-renderer',
  templateUrl: './communication-action-panel-renderer.html',
  styleUrls: ['./communication-action-panel-renderer.scss'],
})
export class CommunicationActionPanelRendererComponent implements ICellRendererAngularComp {
  public params: any;
  public clientCommunicationsEditPermission = PermissionService.create(PermissionTypeEnum.ProjectMessaging, PermissionActionTypeEnum.Edit);

  refresh(): boolean {
    return true;
  }

  agInit(params: any): void {
    this.params = params;
  }

  OnEdit() {
    this.params.onEditHandler(this.params.node.data);
  }
}
